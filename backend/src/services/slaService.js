import Request from "../models/Request.js";
import Department from "../models/Department.js";
import User from "../models/User.js";

/**
 * Get SLA hours for a request based on its category
 * @param {String} serviceType - The service type/category
 * @param {String} departmentId - The department ID
 * @returns {Number} SLA hours for this category
 */
export const getSLAHours = async (serviceType, departmentId) => {
  try {
    const department = await Department.findById(departmentId);
    if (!department) {
      return 72; // Default SLA
    }

    // Check category-specific SLA
    if (department.categorySLA && department.categorySLA.get) {
      const categorySLA = department.categorySLA.get(serviceType);
      if (categorySLA) {
        return categorySLA;
      }
    }

    // Default SLA mappings (can be overridden by department.categorySLA)
    const defaultCategorySLA = {
      "Pothole": 48,
      "Streetlight": 24,
      "Water Supply": 48,
      "Sanitation": 24,
      "Solid Waste": 4,
      "Roads": 48,
      "Drainage": 48,
    };

    return defaultCategorySLA[serviceType] || department.slaHours || 72;
  } catch (error) {
    console.error("Error getting SLA hours:", error);
    return 72; // Default fallback
  }
};

/**
 * Check if a request has breached SLA and escalate if needed
 * @param {String} requestId - The request ID
 * @returns {Object} SLA status information
 */
export const checkSLA = async (requestId) => {
  try {
    const request = await Request.findById(requestId).populate("department");
    if (!request) {
      return { breached: false, message: "Request not found" };
    }

    // Only check SLA for active requests
    if (["completed", "closed", "invalid", "merged"].includes(request.status)) {
      return { breached: false, message: "Request is already closed" };
    }

    const slaHours = await getSLAHours(request.serviceType, request.department?._id || request.department);
    const now = new Date();
    const createdAt = request.timeLogs?.created || request.createdAt || now;
    const hoursElapsed = (now - createdAt) / (1000 * 60 * 60);

    const breached = hoursElapsed > slaHours;
    const hoursRemaining = breached ? 0 : slaHours - hoursElapsed;
    const hoursOverdue = breached ? hoursElapsed - slaHours : 0;

    // Auto-escalate to Department Head if SLA breached
    if (breached && !request.escalated) {
      const department = await Department.findById(request.department?._id || request.department);
      if (department && department.head) {
        // Mark as escalated
        request.escalated = true;
        request.escalatedAt = now;
        request.escalatedTo = department.head;
        
        // Add to history
        if (!request.history) {
          request.history = [];
        }
        request.history.push({
          status: "escalated",
          by: null, // System escalation
          message: `SLA breached: ${hoursOverdue.toFixed(1)} hours overdue. Escalated to Department Head.`,
          createdAt: now,
        });

        await request.save();

        // TODO: Send notification to Department Head
        // await notificationService.sendSLAEscalation(department.head, request);
      }
    }

    return {
      breached,
      slaHours,
      hoursElapsed: hoursElapsed.toFixed(2),
      hoursRemaining: hoursRemaining.toFixed(2),
      hoursOverdue: hoursOverdue.toFixed(2),
      escalated: request.escalated || false,
    };
  } catch (error) {
    console.error("Error checking SLA:", error);
    return { breached: false, message: "Error checking SLA" };
  }
};

/**
 * Check all active requests for SLA breaches
 * @param {String} departmentId - Optional department ID to filter
 * @returns {Array} List of requests that have breached SLA
 */
export const checkAllSLAs = async (departmentId = null) => {
  try {
    const filter = {
      status: { $nin: ["completed", "closed", "invalid", "merged"] },
    };
    if (departmentId) {
      filter.department = departmentId;
    }

    const requests = await Request.find(filter);
    const breachedRequests = [];

    for (const request of requests) {
      const slaStatus = await checkSLA(request._id);
      if (slaStatus.breached) {
        breachedRequests.push({
          requestId: request._id,
          serviceType: request.serviceType,
          status: request.status,
          ...slaStatus,
        });
      }
    }

    return breachedRequests;
  } catch (error) {
    console.error("Error checking all SLAs:", error);
    return [];
  }
};


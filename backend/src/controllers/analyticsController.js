import Request from "../models/Request.js";
import Team from "../models/Team.js";
import User from "../models/User.js";
import Department from "../models/Department.js";

// Get analytics for Department Head
export const getDepartmentAnalytics = async (req, res) => {
  try {
    const deptHeadId = req.user._id;
    const deptHead = await User.findById(deptHeadId).populate("department");
    if (!deptHead || deptHead.role !== "dept_head") {
      return res.status(403).json({ message: "Only department heads can view analytics" });
    }

    const departmentId = deptHead.department?._id || deptHead.department;
    if (!departmentId) {
      return res.status(400).json({ message: "Department head must be assigned to a department" });
    }

    const department = await Department.findById(departmentId);
    const slaHours = department?.slaHours || 72;

    // Get all requests for this department
    const allRequests = await Request.find({ department: departmentId }).lean();

    // Total requests
    const totalRequests = allRequests.length;

    // Requests by status
    const byStatus = {
      submitted: allRequests.filter((r) => r.status === "submitted").length,
      validating: allRequests.filter((r) => r.status === "validating").length,
      pending_assignment: allRequests.filter((r) => r.status === "pending_assignment").length,
      assigned: allRequests.filter((r) => r.status === "assigned").length,
      working: allRequests.filter((r) => r.status === "working").length,
      completed: allRequests.filter((r) => ["completed", "closed"].includes(r.status)).length,
      invalid: allRequests.filter((r) => r.status === "invalid").length,
    };

    // SLA Compliance
    const now = new Date();
    const slaCompliant = allRequests.filter((req) => {
      if (!["completed", "closed"].includes(req.status)) {
        const hoursElapsed = (now - new Date(req.createdAt)) / (1000 * 60 * 60);
        return hoursElapsed <= slaHours;
      }
      if (req.completion?.submittedAt) {
        const hoursTaken = (new Date(req.completion.submittedAt) - new Date(req.createdAt)) / (1000 * 60 * 60);
        return hoursTaken <= slaHours;
      }
      return false;
    }).length;

    const slaComplianceRate = totalRequests > 0 ? ((slaCompliant / totalRequests) * 100).toFixed(1) : 0;

    // Requests by category/service type
    const categoryTrends = {};
    allRequests.forEach((req) => {
      const category = req.serviceType || "Unknown";
      categoryTrends[category] = (categoryTrends[category] || 0) + 1;
    });

    // Team Performance
    const teams = await Team.find({ department: departmentId })
      .populate("leader", "name email")
      .populate("members", "name")
      .lean();

    const teamPerformance = await Promise.all(
      teams.map(async (team) => {
        // Get requests assigned to this team's leader
        const teamRequests = await Request.find({
          assignedTo: team.leader._id,
          department: departmentId,
        }).lean();

        const completed = teamRequests.filter((r) => ["completed", "closed"].includes(r.status)).length;
        const inProgress = teamRequests.filter((r) => ["assigned", "working", "completed_on_site", "in_review"].includes(r.status)).length;
        const avgCompletionTime = teamRequests
          .filter((r) => r.completion?.submittedAt)
          .reduce((sum, r) => {
            const hours = (new Date(r.completion.submittedAt) - new Date(r.createdAt)) / (1000 * 60 * 60);
            return sum + hours;
          }, 0) / (completed || 1);

        return {
          teamId: team._id,
          teamName: team.name,
          leaderName: team.leader.name,
          totalRequests: teamRequests.length,
          completed,
          inProgress,
          avgCompletionHours: avgCompletionTime ? avgCompletionTime.toFixed(1) : 0,
          memberCount: team.members?.length || 0,
        };
      })
    );

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentRequests = allRequests.filter((r) => new Date(r.createdAt) >= sevenDaysAgo).length;

    // Average time taken per category
    const avgTimePerCategory = {};
    Object.keys(categoryTrends).forEach((category) => {
      const categoryRequests = allRequests.filter((r) => r.serviceType === category);
      const completedCategoryRequests = categoryRequests.filter((r) => 
        r.completion?.submittedAt && r.timeLogs?.created
      );
      if (completedCategoryRequests.length > 0) {
        const totalHours = completedCategoryRequests.reduce((sum, r) => {
          const hours = (new Date(r.completion.submittedAt) - new Date(r.timeLogs.created || r.createdAt)) / (1000 * 60 * 60);
          return sum + hours;
        }, 0);
        avgTimePerCategory[category] = (totalHours / completedCategoryRequests.length).toFixed(1);
      }
    });

    // Citizen satisfaction rating
    const satisfactionData = allRequests
      .filter((r) => r.citizenFeedback?.rating)
      .map((r) => r.citizenFeedback.rating);
    const avgSatisfaction = satisfactionData.length > 0
      ? (satisfactionData.reduce((a, b) => a + b, 0) / satisfactionData.length).toFixed(1)
      : 0;
    const satisfactionCount = satisfactionData.length;

    res.json({
      department: {
        name: department?.name,
        slaHours,
      },
      summary: {
        totalRequests,
        recentRequests,
        slaComplianceRate: parseFloat(slaComplianceRate),
        slaCompliant,
        totalRequestsForSLA: totalRequests,
        avgSatisfaction: parseFloat(avgSatisfaction),
        satisfactionCount,
      },
      byStatus,
      categoryTrends,
      teamPerformance,
      avgTimePerCategory,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch analytics" });
  }
};

/**
 * Get reports (daily/weekly/monthly)
 * GET /api/analytics/reports?period=daily|weekly|monthly&departmentId=...
 */
export const getReports = async (req, res) => {
  try {
    const { period = "monthly", departmentId } = req.query;
    const now = new Date();
    let startDate;

    switch (period) {
      case "daily":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "weekly":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "monthly":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const filter = { createdAt: { $gte: startDate } };
    if (departmentId) filter.department = departmentId;

    const requests = await Request.find(filter).lean();
    const completed = requests.filter((r) => ["completed", "closed"].includes(r.status));
    
    // SLA breaches
    const slaBreaches = requests.filter((r) => {
      if (["completed", "closed"].includes(r.status)) return false;
      const hoursElapsed = (now - new Date(r.createdAt)) / (1000 * 60 * 60);
      // Using default 72h for now, should use category-specific SLA
      return hoursElapsed > 72;
    });

    res.json({
      period,
      startDate,
      endDate: new Date(),
      totalRequests: requests.length,
      completed: completed.length,
      slaBreaches: slaBreaches.length,
      byCategory: requests.reduce((acc, r) => {
        acc[r.serviceType] = (acc[r.serviceType] || 0) + 1;
        return acc;
      }, {}),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get heatmap data (GIS-based request locations)
 * GET /api/analytics/heatmap?departmentId=...
 */
export const getHeatmap = async (req, res) => {
  try {
    const { departmentId } = req.query;
    const filter = {};
    if (departmentId) filter.department = departmentId;

    const requests = await Request.find(filter)
      .select("location serviceType status createdAt")
      .lean();

    const heatmapData = requests
      .filter((r) => r.location?.lat && r.location?.lng)
      .map((r) => ({
        lat: r.location.lat,
        lng: r.location.lng,
        address: r.location.address,
        serviceType: r.serviceType,
        status: r.status,
        weight: r.status === "completed" ? 1 : r.status === "working" ? 2 : 3, // Higher weight for active issues
      }));

    res.json({ heatmapData, count: heatmapData.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get SLA breach report
 * GET /api/analytics/sla-breaches?departmentId=...
 */
export const getSLABreachReport = async (req, res) => {
  try {
    const { departmentId } = req.query;
    const filter = { status: { $nin: ["completed", "closed", "invalid", "merged"] } };
    if (departmentId) filter.department = departmentId;

    const requests = await Request.find(filter)
      .populate("department", "name categorySLA slaHours")
      .lean();

    const now = new Date();
    const breaches = [];

    for (const req of requests) {
      const slaHours = req.department?.categorySLA?.get?.(req.serviceType) || 
                       req.department?.slaHours || 72;
      const createdAt = req.timeLogs?.created || req.createdAt;
      const hoursElapsed = (now - new Date(createdAt)) / (1000 * 60 * 60);
      
      if (hoursElapsed > slaHours) {
        breaches.push({
          requestId: req._id,
          serviceType: req.serviceType,
          status: req.status,
          hoursOverdue: (hoursElapsed - slaHours).toFixed(1),
          hoursElapsed: hoursElapsed.toFixed(1),
          slaHours,
          escalated: req.escalated || false,
        });
      }
    }

    res.json({ breaches, count: breaches.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get team performance ranking
 * GET /api/analytics/team-ranking?departmentId=...
 */
export const getTeamRanking = async (req, res) => {
  try {
    const { departmentId } = req.query;
    const filter = {};
    if (departmentId) filter.department = departmentId;

    const teams = await Team.find(filter)
      .populate("leader", "name email")
      .populate("members", "name")
      .lean();

    const ranking = await Promise.all(
      teams.map(async (team) => {
        const teamRequests = await Request.find({
          assignedTo: team.leader._id,
          ...filter,
        }).lean();

        const completed = teamRequests.filter((r) => ["completed", "closed"].includes(r.status)).length;
        const total = teamRequests.length;
        const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

        // Calculate average completion time
        const completedRequests = teamRequests.filter((r) => r.completion?.submittedAt);
        const avgTime = completedRequests.length > 0
          ? completedRequests.reduce((sum, r) => {
              const hours = (new Date(r.completion.submittedAt) - new Date(r.timeLogs?.created || r.createdAt)) / (1000 * 60 * 60);
              return sum + hours;
            }, 0) / completedRequests.length
          : 0;

        // Calculate satisfaction score
        const ratings = teamRequests
          .filter((r) => r.citizenFeedback?.rating)
          .map((r) => r.citizenFeedback.rating);
        const avgRating = ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

        // Performance score (weighted)
        const performanceScore = (
          parseFloat(completionRate) * 0.4 +
          (avgTime > 0 ? Math.max(0, 100 - (avgTime / 72) * 100) : 0) * 0.3 +
          avgRating * 10 * 0.3
        ).toFixed(1);

        return {
          teamId: team._id,
          teamName: team.name,
          leaderName: team.leader.name,
          totalRequests: total,
          completed,
          completionRate: parseFloat(completionRate),
          avgCompletionHours: avgTime.toFixed(1),
          avgSatisfaction: avgRating.toFixed(1),
          performanceScore: parseFloat(performanceScore),
          memberCount: team.members?.length || 0,
        };
      })
    );

    // Sort by performance score
    ranking.sort((a, b) => b.performanceScore - a.performanceScore);

    res.json({ ranking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


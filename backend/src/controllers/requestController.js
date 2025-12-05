import Request from "../models/Request.js";
import User from "../models/User.js";
import Team from "../models/Team.js";

const pushHistory = (request, status, by, message) => {
  request.history.push({
    status,
    by,
    message,
    createdAt: new Date(),
  });
};

// Public endpoint - no auth required
export const getPublicRequests = async (req, res) => {
  try {
    const requests = await Request.find({})
      .populate("citizen", "name")
      .select("serviceType description status priority supportCount createdAt location")
      .sort({ supportCount: -1, createdAt: -1 })
      .limit(100);
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRequests = async (req, res) => {
  try {
    const { citizenId, status, departmentId, assignedTo, taskAssignee, myTeamTasks, serviceType } = req.query;
    const filters = {};

    // For department head: auto-filter by their department if not specified
    if (req.user && req.user.role === "dept_head" && !departmentId) {
      if (req.user.department) {
        filters.department = req.user.department;
      }
    }

    if (citizenId) filters.citizen = citizenId;
    if (status) filters.status = status;
    if (departmentId) {
      filters.department = departmentId;
    }
    if (serviceType) {
      filters.serviceType = serviceType;
    }
    if (assignedTo) filters.assignedTo = assignedTo === "me" && req.user ? req.user._id : assignedTo;
    if (taskAssignee) {
      filters["tasks.assignedTo"] =
        taskAssignee === "me" && req.user ? req.user._id : taskAssignee;
    }

    // For team members: get requests where tasks are assigned to them individually
    // Team members should only see tasks assigned to them, not all team tasks
    if (myTeamTasks === "true" && req.user && req.user.role === "team_member") {
      const userId = req.user._id;
      // Filter for tasks where the user is in assignedMembers array
      filters["tasks.assignedMembers"] = userId;
    }

    const requests = await Request.find(filters)
      .populate("citizen department assignedTo tasks.assignedTo tasks.assignedMembers", "name email role")
      .populate({
        path: "tasks.assignedTeam",
        select: "name _id members",
        populate: { 
          path: "leader", 
          select: "name email" 
        }
      })
      .sort({ supportCount: -1, createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public endpoint - no auth required
export const getPublicRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("citizen", "name")
      .select("citizen serviceType description status priority supportCount createdAt updatedAt location attachmentUrl history supporters")
      .lean();
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("citizen department assignedTo", "name email role")
      .populate("tasks.assignedTo", "name email role")
      .populate("tasks.assignedMembers", "name email role")
      .populate("completion.submittedBy", "name email role")
      .populate("verification.verifiedBy", "name email role")
      .populate({
        path: "tasks.assignedTeam",
        select: "name _id members",
        populate: { path: "members", select: "name" },
      })
      .lean();
    if (!request) return res.status(404).json({ message: "Request not found" });
    
    // For citizens, hide worker names and show only team info
    if (req.user && req.user.role === "citizen") {
      // Remove assignedTo name if it's a staff member
      if (request.assignedTo && request.assignedTo.role !== "citizen") {
        request.assignedTo = { _id: request.assignedTo._id, role: request.assignedTo.role };
      }
      
      // For tasks, hide individual worker names, show only team info
      if (request.tasks) {
        request.tasks = request.tasks.map((task) => {
          if (task.assignedTo && typeof task.assignedTo === "object" && task.assignedTo.role !== "citizen") {
            // Hide worker name, keep only ID
            task.assignedTo = { _id: task.assignedTo._id, role: task.assignedTo.role };
          }
          // Hide assignedMembers names - citizens should not see individual worker names
          if (task.assignedMembers && Array.isArray(task.assignedMembers)) {
            task.assignedMembers = task.assignedMembers.map((member) => ({
              _id: member._id || member,
              role: member.role || "team_member"
            }));
          }
          // Keep team info visible (name and ID) but hide member details
          if (task.assignedTeam && task.assignedTeam.members) {
            task.assignedTeam = {
              _id: task.assignedTeam._id,
              name: task.assignedTeam.name,
              // Don't include members array for citizens
            };
          }
          return task;
        });
      }
    }
    
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const findSimilarRequests = async (req, res) => {
  try {
    const { serviceType, description = "", address = "", lat, lng } = req.body;
    if (!serviceType || !description) {
      return res.status(400).json({ message: "serviceType and description are required" });
    }

    const words = description
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length >= 4);

    const keywords = Array.from(new Set(words)).slice(0, 5);

    const orConditions = keywords.map((w) => ({
      $or: [
        { description: { $regex: w, $options: "i" } },
        { "location.address": { $regex: w, $options: "i" } },
      ],
    }));

    const query = {
      serviceType,
      status: { $nin: ["closed", "invalid", "merged"] },
    };

    if (orConditions.length > 0) {
      query.$and = orConditions;
    }

    // GPS proximity check: if lat/lng provided, find requests within ~1km radius
    let similar = [];
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      // Rough distance calculation: ~1km radius (0.009 degrees ≈ 1km)
      const radius = 0.009;
      
      const allRequests = await Request.find(query).lean();
      
      // Filter by GPS proximity
      similar = allRequests
        .filter((req) => {
          if (!req.location?.lat || !req.location?.lng) return false;
          const reqLat = parseFloat(req.location.lat);
          const reqLng = parseFloat(req.location.lng);
          
          // Calculate distance using Haversine formula (simplified)
          const latDiff = Math.abs(userLat - reqLat);
          const lngDiff = Math.abs(userLng - reqLng);
          const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
          
          return distance <= radius;
        })
        .sort((a, b) => {
          // Sort by support count first, then by proximity
          if (b.supportCount !== a.supportCount) {
            return (b.supportCount || 0) - (a.supportCount || 0);
          }
          // Then by creation date
          return new Date(b.createdAt) - new Date(a.createdAt);
        })
        .slice(0, 10);
    } else {
      // No GPS, use keyword-based search only
      similar = await Request.find(query)
        .sort({ supportCount: -1, createdAt: -1 })
        .limit(10)
        .lean();
    }

    res.json(similar);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const supportRequest = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.citizen?.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot support your own request" });
    }

    const alreadySupported = request.supporters.some((s) => s.toString() === userId.toString());
    if (alreadySupported) {
      return res.status(400).json({ message: "You already support this request" });
    }

    request.supporters.push(userId);
    request.supportCount = (request.supportCount || 0) + 1;
    request.history.push({
      status: "Supported",
      by: userId,
      message: "Citizen expressed support",
    });

    await request.save();

    const populated = await Request.findById(request._id)
      .populate("citizen department assignedTo", "name email role")
      .lean();

    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const validateRequest = async (req, res) => {
  try {
    const { status, notes } = req.body; // status: 'valid' | 'invalid'
    if (!["valid", "invalid"].includes(status)) {
      return res.status(400).json({ message: "status must be valid or invalid" });
    }
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.validationStatus = status;
    request.validationHistory.push({
      status,
      notes,
      by: req.user?._id,
    });

    if (status === "valid") {
      request.status = "pending_assignment";
      request.timeLogs = request.timeLogs || {};
      request.timeLogs.validated = new Date();
      pushHistory(request, "pending_assignment", req.user?._id, "Request validated");
    } else {
      request.status = "invalid";
      request.timeLogs = request.timeLogs || {};
      request.timeLogs.validated = new Date();
      pushHistory(request, "invalid", req.user?._id, notes || "Request rejected by department head");
    }

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const assignTeamLeader = async (req, res) => {
  try {
    const { teamLeaderId, teamLeaderEmail, deadline, notes, costEstimate } = req.body;
    if (!teamLeaderId && !teamLeaderEmail) {
      return res.status(400).json({ message: "teamLeaderId or teamLeaderEmail is required" });
    }

    let leaderId = teamLeaderId;
    if (!leaderId && teamLeaderEmail) {
      const leader = await User.findOne({ email: teamLeaderEmail.toLowerCase(), role: "team_leader" });
      if (!leader) {
        return res.status(404).json({ message: "Team leader with that email not found" });
      }
      leaderId = leader._id;
    }

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const assignedAt = new Date();
    request.assignment = {
      teamLeader: leaderId,
      assignedAt,
      deadline: deadline ? new Date(deadline) : undefined,
      notes,
    };
    request.assignedTo = leaderId;
    request.status = "assigned";
    request.timeLogs = request.timeLogs || {};
    request.timeLogs.assigned = assignedAt;
    if (costEstimate !== undefined) {
      request.costEstimate = Number(costEstimate);
    }
    pushHistory(request, "assigned", req.user?._id, "Assigned to team leader");
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const addTask = async (req, res) => {
  try {
    const { title, description, assignedTo, assignedTeam, assignedMembers, estimatedTime, requiredWorkers, deadline, instructions, notes } = req.body;
    if (!title) return res.status(400).json({ message: "Task title is required" });
    if (!assignedTeam && !assignedTo) {
      return res.status(400).json({ message: "Either assignedTeam or assignedTo is required" });
    }

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Business Rule: Only one task can exist at a time
    // Exception: New task can be created if previous task's report was rejected
    const existingTasks = request.tasks || [];
    const hasActiveTask = existingTasks.some(task => {
      // Active task: not completed, or completed but report not submitted, or report pending/rejected
      return task.status !== "completed" || 
             !task.reportSubmitted || 
             (task.reportStatus === "pending" || task.reportStatus === "rejected");
    });

    // Check if request is already completed (no more tasks allowed)
    if (request.status === "completed" || request.status === "closed") {
      return res.status(400).json({ message: "Cannot create task for a completed request" });
    }

    // Check if there's an active task that hasn't been rejected
    const hasNonRejectedTask = existingTasks.some(task => {
      if (task.status === "completed" && task.reportSubmitted) {
        // If report was accepted, no new task allowed
        if (task.reportStatus === "accepted") {
          return true;
        }
        // If report was rejected, new task can be created
        return false;
      }
      // If task is not completed or report not submitted, it's still active
      return task.status !== "completed" || !task.reportSubmitted;
    });

    if (hasNonRejectedTask) {
      const activeTask = existingTasks.find(task => 
        task.status !== "completed" || 
        !task.reportSubmitted || 
        task.reportStatus === "pending"
      );
      
      if (activeTask) {
        if (activeTask.status === "completed" && activeTask.reportStatus === "pending") {
          return res.status(400).json({ 
            message: "Cannot create new task. Previous task's completion report is pending department head review." 
          });
        }
        if (activeTask.status !== "completed") {
          return res.status(400).json({ 
            message: "Cannot create new task. There is already an active task for this request. Complete the current task first." 
          });
        }
      }
    }

    // Verify team exists if assignedTeam is provided
    if (assignedTeam) {
      const team = await Team.findById(assignedTeam);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Verify assigned members are part of the team
      if (assignedMembers && assignedMembers.length > 0) {
        const teamMemberIds = team.members.map(m => m.toString());
        const invalidMembers = assignedMembers.filter(mId => !teamMemberIds.includes(mId.toString()));
        if (invalidMembers.length > 0) {
          return res.status(400).json({ message: "Some assigned members are not part of the selected team" });
        }
      }
    }

    request.tasks.push({
      title,
      description,
      assignedTo, // legacy support
      assignedTeam, // new: assign to team
      assignedMembers: assignedMembers || [], // individual team members assigned
      estimatedTime: estimatedTime ? Number(estimatedTime) : undefined,
      requiredWorkers: requiredWorkers ? Number(requiredWorkers) : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      instructions,
      notes,
      reportSubmitted: false,
      // reportStatus is not set here - it will be set when the report is submitted/reviewed
    });
    // Allow transition to working from assigned, pending_assignment, or rework_required
    if (["assigned", "pending_assignment", "rework_required"].includes(request.status)) {
      request.status = "working";
      request.timeLogs = request.timeLogs || {};
      if (!request.timeLogs.workingStart) {
        request.timeLogs.workingStart = new Date();
      }
      pushHistory(request, "working", req.user?._id, "Team started working");
    }
    await request.save();
    res.json(request.tasks[request.tasks.length - 1]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    const task = request.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Validate status transition based on workflow rules
    if (status) {
      const currentStatus = task.status;
      const validTransitions = {
        todo: ["in_progress"], // Can only go to in_progress
        in_progress: ["blocked", "completed"], // Can go to blocked or completed
        blocked: ["in_progress", "completed"], // Can go back to in_progress or to completed
        completed: [] // Cannot transition from completed (final state)
      };

      // Check if transition is valid
      if (currentStatus === "completed") {
        return res.status(400).json({ 
          message: "Cannot change status of a completed task. Task is in final state." 
        });
      }

      if (!validTransitions[currentStatus]?.includes(status)) {
        return res.status(400).json({ 
          message: `Invalid status transition. Cannot change from "${currentStatus}" to "${status}". Valid transitions: ${validTransitions[currentStatus]?.join(", ") || "none"}` 
        });
      }

      // Apply status change
      task.status = status;
      if (status === "in_progress") task.startedAt = task.startedAt || new Date();
      if (status === "completed") {
        task.completedAt = new Date();
        task.completedBy = req.user._id; // Track who completed it
      }
    }

    // Verify user is assigned to this task (team member must be in assignedMembers)
    if (req.user.role === "team_member") {
      const userId = req.user._id.toString();
      const isAssigned = task.assignedMembers?.some(
        (member) => (member._id || member).toString() === userId
      );
      if (!isAssigned) {
        return res.status(403).json({ message: "This task is not assigned to you" });
      }
    }

    if (notes) task.notes = notes;

    await request.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const submitCompletion = async (req, res) => {
  try {
    const { timeTakenHours, costIncurred, materialsUsed, memberNames = [], notes, taskId } = req.body;
    const evidenceFiles = req.files?.map((file) => `/uploads/${file.filename}`) || [];

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Find the completed task
    const task = request.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify task is completed
    if (task.status !== "completed") {
      return res.status(400).json({ message: "Task must be completed before submitting report" });
    }

    // Check if report already submitted for this task
    if (task.reportSubmitted) {
      return res.status(400).json({ message: "Completion report already submitted for this task" });
    }

    // Mark task report as submitted
    task.reportSubmitted = true;
    task.reportSubmittedAt = new Date();
    task.reportStatus = "pending";

    // Store completion data in request (for backward compatibility and department head view)
    request.completion = {
      submittedBy: req.user?._id,
      submittedAt: new Date(),
      timeTakenHours: timeTakenHours ? Number(timeTakenHours) : undefined,
      costIncurred: costIncurred ? Number(costIncurred) : undefined,
      materialsUsed,
      memberNames: Array.isArray(memberNames) ? memberNames : (memberNames ? [memberNames] : []),
      notes,
      evidence: evidenceFiles,
      taskId: taskId, // Link to the specific task
    };
    
    // Transition to completed_on_site for Department Head verification
    request.status = "completed_on_site";
    request.timeLogs = request.timeLogs || {};
    request.timeLogs.completed = new Date();
    pushHistory(request, "completed_on_site", req.user?._id, "Team leader submitted completion report");

    await request.save();
    res.json({ task: task, completion: request.completion });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const verifyCompletion = async (req, res) => {
  try {
    const { decision, notes, taskId } = req.body; // decision: 'accepted' | 'rejected'
    if (!["accepted", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "decision must be accepted or rejected" });
    }

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Only allow verification from completed_on_site or in_review status
    if (!["completed_on_site", "in_review"].includes(request.status)) {
      return res.status(400).json({ message: "Request is not in a state that can be verified" });
    }

    // Find the task that has pending report
    const taskWithPendingReport = request.tasks.find(t => 
      t.reportSubmitted && t.reportStatus === "pending"
    );

    if (!taskWithPendingReport) {
      return res.status(400).json({ message: "No pending completion report found" });
    }

    // Update task report status
    taskWithPendingReport.reportStatus = decision === "accepted" ? "accepted" : "rejected";
    taskWithPendingReport.reportReviewedBy = req.user?._id;
    taskWithPendingReport.reportReviewedAt = new Date();
    taskWithPendingReport.reportReviewNotes = notes;

    // Store verification in request (for backward compatibility)
    request.verification = {
      status: decision === "accepted" ? "accepted" : "rejected",
      verifiedBy: req.user?._id,
      verifiedAt: new Date(),
      notes,
    };

    request.timeLogs = request.timeLogs || {};
    request.timeLogs.verified = new Date();
    
    if (decision === "accepted") {
      request.status = "completed";
      pushHistory(request, "completed", req.user?._id, "Department head accepted completion");
    } else {
      // If rejected, allow new task creation - status goes to rework_required
      request.status = "rework_required";
      pushHistory(request, "rework_required", req.user?._id, notes || "Department head requested rework. New task can be created.");
    }

    await request.save();
    res.json({ verification: request.verification, task: taskWithPendingReport });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const mergeRequests = async (req, res) => {
  try {
    const { parentId, childIds = [] } = req.body;
    const parent = await Request.findById(parentId);
    if (!parent) return res.status(404).json({ message: "Parent request not found" });

    const children = await Request.find({ _id: { $in: childIds } });
    children.forEach((child) => {
      child.parentRequest = parentId;
      child.status = "merged";
    });
    await Promise.all(children.map((child) => child.save()));

    parent.mergedChildren = Array.from(new Set([...(parent.mergedChildren || []), ...childIds]));
    await parent.save();

    res.json({ message: "Requests merged", parent });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const addCitizenFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.citizen?.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ message: "Only the original citizen can leave feedback" });
    }
    if (!["completed", "closed"].includes(request.status)) {
      return res.status(400).json({ message: "Feedback allowed after completion" });
    }

    // Check if feedback already exists - each user can only comment once
    if (request.citizenFeedback && request.citizenFeedback.createdAt) {
      return res.status(400).json({ message: "You have already submitted feedback for this request. Each user can only comment once." });
    }

    request.citizenFeedback = {
      rating,
      comment,
      createdAt: new Date(),
    };
    if (request.status === "completed") {
      request.status = "closed";
      pushHistory(request, "closed", req.user?._id, "Citizen acknowledged completion");
    }

    await request.save();
    res.json(request.citizenFeedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const createRequest = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { serviceType, description, priority, lat, lng, address, departmentId } = req.body;
    if (!serviceType) {
      return res.status(400).json({ message: "serviceType is required" });
    }

    const payload = {
      citizen: req.user._id,
      serviceType,
      description,
      priority: priority || "medium",
      department: departmentId || undefined,
    };

    if (lat || lng || address) {
      payload.location = {
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
        address,
      };
    }

    if (req.file) {
      payload.attachmentUrl = `/uploads/${req.file.filename}`;
    }

    const request = await Request.create(payload);
    // Ensure timeLogs.created is set
    if (!request.timeLogs) {
      request.timeLogs = {};
    }
    if (!request.timeLogs.created) {
      request.timeLogs.created = request.createdAt || new Date();
      await request.save();
    }
    res.status(201).json({ message: "Request submitted", request });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  const { status, message, by } = req.body;
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status || request.status;
    request.history.push({ status, message, by });
    await request.save();

    res.json({ message: "Status updated", request });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: "Request deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

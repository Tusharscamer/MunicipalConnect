import Team from "../models/Team.js";
import User from "../models/User.js";
import Request from "../models/Request.js";
import Department from "../models/Department.js";

// Get all team members in a department (for team leader or dept head to see available workers)
export const getDepartmentMembers = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const currentUser = req.user;
    
    // If dept_head, return all staff (team_members and team_leaders)
    // If team_leader, return only team_members
    const roleFilter = currentUser?.role === "dept_head" 
      ? { role: { $in: ["team_member", "team_leader"] } }
      : { role: "team_member" };
    
    const members = await User.find({
      ...roleFilter,
      department: departmentId,
    })
      .select("name email phone _id role")
      .lean();

    res.json(members);
  } catch (err) {
    console.error("Get department members error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch members" });
  }
};

// Create a new team (by team leader OR department head)
export const createTeam = async (req, res) => {
  try {
    const { name, departmentId, memberIds, leaderId: providedLeaderId } = req.body;
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);

    if (!name || !departmentId) {
      return res.status(400).json({ message: "Team name and department are required" });
    }

    // Determine team leader: if dept_head provides leaderId, use it; otherwise use current user
    let teamLeaderId = providedLeaderId || currentUserId;
    
    // If dept_head is creating, they must provide a leaderId
    if (currentUser.role === "dept_head" && !providedLeaderId) {
      return res.status(400).json({ message: "Department head must specify a team leader when creating a team" });
    }

    // If current user is team_leader, they become the leader
    if (currentUser.role !== "team_leader" && currentUser.role !== "dept_head") {
      return res.status(403).json({ message: "Only team leaders or department heads can create teams" });
    }

    // Verify the assigned leader is a team_leader or promote them
    const assignedLeader = await User.findById(teamLeaderId);
    if (!assignedLeader) {
      return res.status(404).json({ message: "Team leader not found" });
    }

    // If assigned leader is not a team_leader, promote them
    if (assignedLeader.role !== "team_leader") {
      if (assignedLeader.role !== "team_member") {
        return res.status(400).json({ message: "Team leader must be a team member or team leader" });
      }
      // Promote team_member to team_leader
      assignedLeader.role = "team_leader";
      await assignedLeader.save();
    }

    // Verify department exists
    const dept = await Department.findById(departmentId);
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Verify all member IDs are valid team_members in the same department
    if (memberIds && memberIds.length > 0) {
      const members = await User.find({
        _id: { $in: memberIds },
        role: "team_member",
        department: departmentId,
      });
      if (members.length !== memberIds.length) {
        return res.status(400).json({ message: "Some member IDs are invalid or not in this department" });
      }
    }

    const team = await Team.create({
      name,
      department: departmentId,
      leader: teamLeaderId,
      members: memberIds || [],
    });

    const populated = await Team.findById(team._id)
      .populate("department", "name")
      .populate("leader", "name email")
      .populate("members", "name email phone")
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    console.error("Create team error:", err);
    res.status(500).json({ message: err.message || "Failed to create team" });
  }
};

// Get all teams for a team leader
export const getMyTeams = async (req, res) => {
  try {
    const leaderId = req.user._id;
    const teams = await Team.find({ leader: leaderId })
      .populate("department", "name")
      .populate("members", "name email phone")
      .lean();

    res.json(teams);
  } catch (err) {
    console.error("Get my teams error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch teams" });
  }
};

// Get team by ID
export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const team = await Team.findById(id)
      .populate("department", "name")
      .populate("leader", "name email")
      .populate("members", "name email phone")
      .lean();

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json(team);
  } catch (err) {
    console.error("Get team error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch team" });
  }
};

// Reassign team leader (Department Head only) - handles role transition
export const reassignTeamLeader = async (req, res) => {
  try {
    const { id } = req.params;
    const { newLeaderId } = req.body;
    const deptHeadId = req.user._id;

    const deptHead = await User.findById(deptHeadId);
    if (deptHead.role !== "dept_head") {
      return res.status(403).json({ message: "Only department heads can reassign team leaders" });
    }

    if (!newLeaderId) {
      return res.status(400).json({ message: "newLeaderId is required" });
    }

    const team = await Team.findById(id).populate("leader");
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Verify team is in department head's department
    if (team.department.toString() !== deptHead.department?.toString()) {
      return res.status(403).json({ message: "Team is not in your department" });
    }

    const oldLeaderId = team.leader._id;
    const newLeader = await User.findById(newLeaderId);
    if (!newLeader) {
      return res.status(404).json({ message: "New team leader not found" });
    }

    // Verify new leader is in the same department and is a team_member or team_leader
    if (newLeader.department?.toString() !== team.department.toString()) {
      return res.status(400).json({ message: "New leader must be in the same department" });
    }

    if (!["team_member", "team_leader"].includes(newLeader.role)) {
      return res.status(400).json({ message: "New leader must be a team member or team leader" });
    }

    // STEP 1: Demote old leader to team_member
    const oldLeader = await User.findById(oldLeaderId);
    if (oldLeader && oldLeader.role === "team_leader") {
      oldLeader.role = "team_member";
      await oldLeader.save();
    }

    // STEP 2: Promote new leader to team_leader
    if (newLeader.role === "team_member") {
      newLeader.role = "team_leader";
      await newLeader.save();
    }

    // STEP 3: Reassign all open tasks assigned to old leader to new leader
    await Request.updateMany(
      {
        assignedTo: oldLeaderId,
        status: { $nin: ["completed", "closed"] },
      },
      {
        $set: {
          assignedTo: newLeaderId,
          "assignment.teamLeader": newLeaderId,
        },
      }
    );

    // Update team leader
    team.leader = newLeaderId;
    await team.save();

    const populated = await Team.findById(team._id)
      .populate("department", "name")
      .populate("leader", "name email role")
      .populate("members", "name email phone")
      .lean();

    res.json({
      message: "Team leader reassigned successfully",
      team: populated,
      oldLeader: { _id: oldLeaderId, newRole: "team_member" },
      newLeader: { _id: newLeaderId, newRole: "team_leader" },
    });
  } catch (err) {
    console.error("Reassign team leader error:", err);
    res.status(500).json({ message: err.message || "Failed to reassign team leader" });
  }
};

// Get all teams in department (for Department Head)
export const getDepartmentTeams = async (req, res) => {
  try {
    const deptHeadId = req.user._id;
    const deptHead = await User.findById(deptHeadId);
    if (deptHead.role !== "dept_head") {
      return res.status(403).json({ message: "Only department heads can view department teams" });
    }

    const departmentId = deptHead.department;
    if (!departmentId) {
      return res.status(400).json({ message: "Department head must be assigned to a department" });
    }

    const teams = await Team.find({ department: departmentId })
      .populate("department", "name")
      .populate("leader", "name email role")
      .populate("members", "name email phone role")
      .lean();

    res.json(teams);
  } catch (err) {
    console.error("Get department teams error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch teams" });
  }
};

// Update team (add/remove members) - now allows dept_head too
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, memberIds } = req.body;
    const currentUserId = req.user._id;
    const currentUser = await User.findById(currentUserId);

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Allow team leader OR department head to update
    const isTeamLeader = team.leader.toString() === currentUserId.toString();
    const isDeptHead = currentUser.role === "dept_head" && 
                       team.department.toString() === currentUser.department?.toString();

    if (!isTeamLeader && !isDeptHead) {
      return res.status(403).json({ message: "Only the team leader or department head can update this team" });
    }

    if (name) team.name = name;
    if (memberIds !== undefined) {
      // Verify all member IDs are valid team_members in the same department
      if (memberIds.length > 0) {
        const members = await User.find({
          _id: { $in: memberIds },
          role: "team_member",
          department: team.department,
        });
        if (members.length !== memberIds.length) {
          return res.status(400).json({ message: "Some member IDs are invalid or not in this department" });
        }
      }
      team.members = memberIds;
    }

    await team.save();

    const populated = await Team.findById(team._id)
      .populate("department", "name")
      .populate("leader", "name email")
      .populate("members", "name email phone")
      .lean();

    res.json(populated);
  } catch (err) {
    console.error("Update team error:", err);
    res.status(500).json({ message: err.message || "Failed to update team" });
  }
};

// Delete team
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const leaderId = req.user._id;

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (team.leader.toString() !== leaderId.toString()) {
      return res.status(403).json({ message: "Only the team leader can delete this team" });
    }

    // Check if team has any active tasks
    const activeTasks = await Request.find({
      "tasks.assignedTeam": id,
      status: { $nin: ["completed", "closed"] },
    });

    if (activeTasks.length > 0) {
      return res.status(400).json({
        message: "Cannot delete team with active tasks. Please reassign or complete tasks first.",
      });
    }

    await Team.findByIdAndDelete(id);
    res.json({ message: "Team deleted successfully" });
  } catch (err) {
    console.error("Delete team error:", err);
    res.status(500).json({ message: err.message || "Failed to delete team" });
  }
};

// Get team member's team info (which team they're in, leader, department)
export const getMyTeamInfo = async (req, res) => {
  try {
    const memberId = req.user._id;
    
    // Find the team where this member is in the members array
    const team = await Team.findOne({ members: memberId })
      .populate("department", "name")
      .populate("leader", "name email")
      .populate("members", "name email")
      .lean();

    if (!team) {
      return res.json({ 
        team: null, 
        message: "You are not assigned to any team yet. Please contact your Department Head." 
      });
    }

    res.json({ team });
  } catch (err) {
    console.error("Get my team info error:", err);
    res.status(500).json({ message: err.message || "Failed to fetch team info" });
  }
};


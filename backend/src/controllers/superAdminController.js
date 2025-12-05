// backend/src/controllers/superAdminController.js
import User from "../models/User.js";
import Department from "../models/Department.js";
import Team from "../models/Team.js";
import Request from "../models/Request.js";
import bcrypt from "bcryptjs";

/**
 * Create Department Head
 * POST /api/super-admin/create-dept-head
 * Body: { name, email, phone, password, departmentId }
 */
export const createDepartmentHead = async (req, res) => {
  try {
    const { name, email, phone, password, departmentId } = req.body;
    
    if (!name || !email || !password || !departmentId) {
      return res.status(400).json({ message: "Name, email, password, and departmentId are required" });
    }

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Ensure department does not already have a head
    if (department.head) {
      return res.status(409).json({ message: "This department already has a Department Head" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create department head
    const normalizedEmail = email.toLowerCase();
    const deptHead = await User.create({
      name,
      email: normalizedEmail,
      username: normalizedEmail, // ensure non-null unique value for username index
      phone,
      password: hashedPassword,
      role: "dept_head",
      department: departmentId,
      isActive: true,
    });

    // Update department to set this user as head
    department.head = deptHead._id;
    await department.save();

    res.status(201).json({
      message: "Department Head created successfully",
      user: {
        _id: deptHead._id,
        name: deptHead.name,
        email: deptHead.email,
        role: deptHead.role,
        department: deptHead.department,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Create Team
 * POST /api/super-admin/create-team
 * Body: { name, departmentId, leaderId }
 */
export const createTeam = async (req, res) => {
  try {
    const { name, departmentId, leaderId } = req.body;
    
    if (!name || !departmentId || !leaderId) {
      return res.status(400).json({ message: "Name, departmentId, and leaderId are required" });
    }

    // Verify department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Verify leader exists and is a team_leader
    const leader = await User.findById(leaderId);
    if (!leader) {
      return res.status(404).json({ message: "Team leader not found" });
    }
    if (leader.role !== "team_leader") {
      return res.status(400).json({ message: "User must be a team leader" });
    }

    // Ensure this leader is not already assigned as leader of another team
    const existingTeamForLeader = await Team.findOne({ leader: leaderId });
    if (existingTeamForLeader) {
      return res.status(409).json({ message: "This team leader is already assigned to another team" });
    }

    // Create team
    const team = await Team.create({
      name,
      department: departmentId,
      leader: leaderId,
      members: [],
    });

    // Update leader's department if not set
    if (!leader.department) {
      leader.department = departmentId;
      await leader.save();
    }

    res.status(201).json({
      message: "Team created successfully",
      team: await Team.findById(team._id).populate("leader", "name email").populate("members", "name email"),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Add Team Leader
 * POST /api/super-admin/add-team-leader
 * Body: { name, email, phone, password, departmentId }
 */
export const addTeamLeader = async (req, res) => {
  try {
    const { name, email, phone, password, departmentId } = req.body;
    
    if (!name || !email || !password || !departmentId) {
      return res.status(400).json({ message: "Name, email, password, and departmentId are required" });
    }

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create team leader
    const normalizedEmail = email.toLowerCase();
    const teamLeader = await User.create({
      name,
      email: normalizedEmail,
      username: normalizedEmail,
      phone,
      password: hashedPassword,
      role: "team_leader",
      department: departmentId,
      isActive: true,
    });

    res.status(201).json({
      message: "Team Leader created successfully",
      user: {
        _id: teamLeader._id,
        name: teamLeader.name,
        email: teamLeader.email,
        role: teamLeader.role,
        department: teamLeader.department,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Add Team Member
 * POST /api/super-admin/add-team-member
 * Body: { name, email, phone, password, departmentId, teamId, skills, shiftTiming }
 */
export const addTeamMember = async (req, res) => {
  try {
    const { name, email, phone, password, departmentId, teamId, skills, shiftTiming } = req.body;
    
    if (!name || !email || !password || !departmentId) {
      return res.status(400).json({ message: "Name, email, password, and departmentId are required" });
    }

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // If teamId provided, verify team exists
    if (teamId) {
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      if (team.department.toString() !== departmentId) {
        return res.status(400).json({ message: "Team does not belong to the specified department" });
      }
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get team leader if teamId is provided
    let managerId = null;
    if (teamId) {
      const team = await Team.findById(teamId).populate("leader");
      if (team && team.leader) {
        managerId = team.leader._id;
      }
    }

    // Create team member
    const normalizedEmail = email.toLowerCase();
    const teamMember = await User.create({
      name,
      email: normalizedEmail,
      username: normalizedEmail,
      phone,
      password: hashedPassword,
      role: "team_member",
      department: departmentId,
      manager: managerId,
      skills: skills || [],
      shiftTiming:
        shiftTiming || {
          start: "09:00",
          end: "17:00",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        },
      isActive: true,
    });

    // Add to team if teamId provided
    if (teamId) {
      await Team.findByIdAndUpdate(teamId, {
        $addToSet: { members: teamMember._id },
      });
    }

    res.status(201).json({
      message: "Team Member created successfully",
      user: {
        _id: teamMember._id,
        name: teamMember.name,
        email: teamMember.email,
        role: teamMember.role,
        department: teamMember.department,
        team: teamId || null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Move staff between departments
 * PUT /api/super-admin/move-staff/:userId
 * Body: { departmentId, teamId (optional) }
 */
export const moveStaffBetweenDepartments = async (req, res) => {
  try {
    const { userId } = req.params;
    const { departmentId, teamId } = req.body;

    if (!departmentId) {
      return res.status(400).json({ message: "departmentId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only staff can be moved
    if (!["dept_head", "team_leader", "team_member"].includes(user.role)) {
      return res.status(400).json({ message: "Only staff members can be moved between departments" });
    }

    // Verify new department exists
    const newDepartment = await Department.findById(departmentId);
    if (!newDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Enforce one department head per department when moving dept_head
    if (user.role === "dept_head") {
      // Check Department.head flag
      if (newDepartment.head && newDepartment.head.toString() !== userId) {
        return res.status(409).json({ message: "Target department already has a Department Head" });
      }

      // Also check any other user marked as dept_head in that department
      const otherHead = await User.findOne({
        _id: { $ne: userId },
        role: "dept_head",
        department: departmentId,
      });
      if (otherHead) {
        return res.status(409).json({ message: "Target department already has a Department Head" });
      }
    }

    // Remove from old team if user is a team member
    if (user.role === "team_member" && user.manager) {
      await Team.updateMany(
        { members: userId },
        { $pull: { members: userId } }
      );
    }

    // If moving a department head, update department head references
    if (user.role === "dept_head") {
      // Clear as head from old department(s)
      await Department.updateMany({ head: userId }, { $unset: { head: 1 } });
      // Set as head for new department
      newDepartment.head = userId;
      await newDepartment.save();
    }

    // Update user's department
    user.department = departmentId;

    // If teamId provided and user is team_member, add to new team
    if (teamId && user.role === "team_member") {
      const team = await Team.findById(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      if (team.department.toString() !== departmentId) {
        return res.status(400).json({ message: "Team does not belong to the specified department" });
      }
      
      // Add to new team
      await Team.findByIdAndUpdate(teamId, {
        $addToSet: { members: userId },
      });
      
      // Update manager
      user.manager = team.leader;
    }

    await user.save();

    res.json({
      message: "Staff moved successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Remove/Disable staff
 * DELETE /api/super-admin/remove-staff/:userId
 * Query: ?hardDelete=true (default: false, just disable)
 */
export const removeOrDisableStaff = async (req, res) => {
  try {
    const { userId } = req.params;
    const { hardDelete } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only staff can be removed
    if (!["dept_head", "team_leader", "team_member"].includes(user.role)) {
      return res.status(400).json({ message: "Only staff members can be removed" });
    }

    if (hardDelete === "true") {
      // Hard delete - remove from teams first
      if (user.role === "team_leader") {
        await Team.updateMany({ leader: userId }, { $unset: { leader: 1 } });
      }
      if (user.role === "team_member") {
        await Team.updateMany({ members: userId }, { $pull: { members: userId } });
      }
      
      // Remove as department head if applicable
      await Department.updateMany({ head: userId }, { $unset: { head: 1 } });
      
      await User.findByIdAndDelete(userId);
      res.json({ message: "Staff member permanently deleted" });
    } else {
      // Soft delete - just disable
      user.isActive = false;
      await user.save();
      res.json({ message: "Staff member disabled", user });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Enable/reactivate staff
 * PUT /api/super-admin/enable-staff/:userId
 */
export const enableStaff = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!["dept_head", "team_leader", "team_member"].includes(user.role)) {
      return res.status(400).json({ message: "Only staff members can be enabled" });
    }

    if (user.isActive) {
      return res.json({ message: "Staff member is already active", user });
    }

    user.isActive = true;
    await user.save();

    res.json({ message: "Staff member enabled successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update basic staff details
 * PUT /api/super-admin/update-staff/:userId
 * Body: { name?, email?, phone? }
 */
export const updateStaffDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only staff can be updated via this endpoint
    if (!["dept_head", "team_leader", "team_member"].includes(user.role)) {
      return res.status(400).json({ message: "Only staff members can be updated" });
    }

    // If email is being changed, ensure it is unique
    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && existing._id.toString() !== userId) {
        return res.status(409).json({ message: "Another user with this email already exists" });
      }
      user.email = email.toLowerCase();
      user.username = email.toLowerCase();
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      message: "Staff details updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Reset password
 * PUT /api/super-admin/reset-password/:userId
 * Body: { newPassword }
 */
export const resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get all staff (for Super Admin dashboard)
 * GET /api/super-admin/staff
 */
export const getAllStaff = async (req, res) => {
  try {
    const { role, departmentId } = req.query;
    const filter = {
      role: { $in: ["dept_head", "team_leader", "team_member"] },
    };
    
    if (role) filter.role = role;
    if (departmentId) filter.department = departmentId;

    const staff = await User.find(filter)
      .select("-password")
      .populate("department", "name")
      .populate("manager", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get all teams
 * GET /api/super-admin/teams
 */
export const getAllTeams = async (req, res) => {
  try {
    const { departmentId } = req.query;
    const filter = {};
    if (departmentId) filter.department = departmentId;

    const teams = await Team.find(filter)
      .populate("department", "name")
      .populate("leader", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ teams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update team (Super Admin)
 * PUT /api/super-admin/teams/:teamId
 * Body: { name?, departmentId?, leaderId? }
 */
export const updateTeamBySuperAdmin = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, departmentId, leaderId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Update department if provided
    if (departmentId) {
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      team.department = departmentId;
    }

    // Update leader if provided
    if (leaderId) {
      const leader = await User.findById(leaderId);
      if (!leader) {
        return res.status(404).json({ message: "Team leader not found" });
      }
      if (leader.role !== "team_leader") {
        return res.status(400).json({ message: "Selected user is not a team leader" });
      }

      // Ensure this leader is not already assigned to another team
      const existingTeamForLeader = await Team.findOne({
        leader: leaderId,
        _id: { $ne: teamId },
      });
      if (existingTeamForLeader) {
        return res.status(409).json({ message: "This team leader is already assigned to another team" });
      }

      team.leader = leaderId;
    }

    if (name) {
      team.name = name;
    }

    await team.save();

    const populated = await Team.findById(team._id)
      .populate("department", "name")
      .populate("leader", "name email")
      .populate("members", "name email")
      .lean();

    res.json({
      message: "Team updated successfully",
      team: populated,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete team (Super Admin)
 * DELETE /api/super-admin/teams/:teamId
 */
export const deleteTeamBySuperAdmin = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Prevent deleting team with active tasks
    const activeTasks = await Request.find({
      "tasks.assignedTeam": teamId,
      status: { $nin: ["completed", "closed"] },
    });

    if (activeTasks.length > 0) {
      return res.status(400).json({
        message: "Cannot delete team with active tasks. Please reassign or complete tasks first.",
      });
    }

    await Team.findByIdAndDelete(teamId);

    res.json({ message: "Team deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get all departments
 * GET /api/super-admin/departments
 */
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("head", "name email")
      .sort({ name: 1 })
      .lean();

    res.json({ departments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


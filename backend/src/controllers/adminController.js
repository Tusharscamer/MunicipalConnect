// backend/src/controllers/adminController.js
import User from "../models/User.js";
import Complaint from "../models/complain.js";
import Department from "../models/Department.js";
import Team from "../models/Team.js";
import Request from "../models/Request.js";

/**
 * Admin dashboard summary
 * GET /api/admin/dashboard
 * Returns basic counts as JSON
 */
export const getDashboard = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const complaintCount = await Complaint.countDocuments();
    res.json({ userCount, complaintCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete a user (admin)
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Create announcement (simple stub)
 * POST /api/admin/announcement
 */
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: "Title and content required" });
    res.status(201).json({ message: "Announcement created (not persisted)", announcement: { title, content } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get all users with filtering
 * GET /api/admin/users?role=...&department=...
 */
export const getUsers = async (req, res) => {
  try {
    const { role, department, isActive } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    
    const users = await User.find(filter)
      .select("-password")
      .populate("department", "name")
      .lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update user role
 * PUT /api/admin/users/:id/role
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, departmentId } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    if (role) user.role = role;
    if (departmentId) user.department = departmentId;
    await user.save();
    
    res.json({ message: "User role updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Disable/Enable user
 * PUT /api/admin/users/:id/status
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.isActive = isActive !== false;
    await user.save();
    
    res.json({ message: `User ${isActive ? "enabled" : "disabled"}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Verify Aadhaar
 * PUT /api/admin/users/:id/verify-aadhaar
 */
export const verifyAadhaar = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.aadhaarVerified = true;
    await user.save();
    
    res.json({ message: "Aadhaar verified", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Create department
 * POST /api/admin/departments
 */
export const createDepartment = async (req, res) => {
  try {
    const { name, contact, slaHours, categorySLA } = req.body;
    if (!name) return res.status(400).json({ message: "Department name is required" });
    
    const dept = await Department.create({
      name,
      contact,
      slaHours: slaHours || 72,
      categorySLA: categorySLA || {},
    });
    
    res.status(201).json({ message: "Department created", department: dept });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Department name already exists" });
    }
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update department
 * PUT /api/admin/departments/:id
 */
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, slaHours, categorySLA, head } = req.body;
    const dept = await Department.findById(id);
    if (!dept) return res.status(404).json({ message: "Department not found" });
    
    if (name) dept.name = name;
    if (contact !== undefined) dept.contact = contact;
    if (slaHours !== undefined) dept.slaHours = slaHours;
    if (categorySLA) dept.categorySLA = categorySLA;
    if (head) dept.head = head;
    
    await dept.save();
    res.json({ message: "Department updated", department: dept });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get audit logs (request history)
 * GET /api/admin/audit-logs?userId=...&requestId=...&limit=...
 */
export const getAuditLogs = async (req, res) => {
  try {
    const { userId, requestId, limit = 100 } = req.query;
    const filter = {};
    
    if (requestId) {
      const request = await Request.findById(requestId).select("history").lean();
      if (!request) return res.status(404).json({ message: "Request not found" });
      return res.json({ logs: request.history || [] });
    }
    
    // Get all requests with history
    const requests = await Request.find(filter)
      .select("_id serviceType status history createdAt")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    
    const logs = requests.flatMap(req => 
      (req.history || []).map(h => ({
        requestId: req._id,
        serviceType: req.serviceType,
        ...h,
      }))
    );
    
    res.json({ logs: logs.slice(0, Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

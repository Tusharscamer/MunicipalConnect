// backend/src/controllers/complaintController.js
import Complaint from "../models/complain.js";
import User from "../models/User.js";

/**
 * Create a new complaint (only for authenticated users)
 * POST /api/complaints
 */
export const createComplaint = async (req, res) => {
  try {
    // Expect fields in req.body: category, description, address, location{lat,lng}, images (array of urls)
    const payload = {
      user: req.user._id,
      category: req.body.category,
      description: req.body.description,
      address: req.body.address,
      location: req.body.location ? req.body.location : {},
      images: Array.isArray(req.body.images) ? req.body.images : req.body.images ? [req.body.images] : [],
      priority: req.body.priority || "Low",
    };

    const complaint = await Complaint.create(payload);
    res.status(201).json({ message: "Complaint created", complaint });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Get complaints for current authenticated user
 * GET /api/complaints/my
 */
export const getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .populate("user", "name email role")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get complaint details by id
 * GET /api/complaints/:id
 * Accessible by complaint owner OR admin (role middleware can be used but we double-check)
 */
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate("user", "name email role");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // owner or admin allowed
    const isOwner = complaint.user && String(complaint.user._id) === String(req.user._id);
    const isAdmin = req.user && req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Admin: Get all complaints
 * GET /api/complaints
 * Requires role 'admin' (route should attach roleMiddleware)
 */
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(1000);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Admin: Delete complaint by id
 * DELETE /api/complaints/:id
 */
export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    await complaint.remove();
    res.json({ message: "Complaint deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

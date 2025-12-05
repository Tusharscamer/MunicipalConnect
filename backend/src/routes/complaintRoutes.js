// backend/src/routes/complaintRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  createComplaint,
  getUserComplaints,
  getComplaintById,
  getAllComplaints,
  deleteComplaint,
} from "../controllers/complaintController.js";

const router = express.Router();

// POST /api/complaints  (user creates a complaint)
router.post("/", authMiddleware, createComplaint);

// GET /api/complaints/my  (user list own complaints)
router.get("/my", authMiddleware, getUserComplaints);

// GET /api/complaints/:id  (owner or admin)
router.get("/:id", authMiddleware, getComplaintById);

// GET /api/complaints  (admin list all)
router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllComplaints);

// DELETE /api/complaints/:id  (admin)
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteComplaint);

export default router;

// routes/adminRoutes.js
import express from "express";
import { body } from "express-validator";
import {
  getDashboard,
  deleteUser,
  createAnnouncement,
  getUsers,
  updateUserRole,
  updateUserStatus,
  verifyAadhaar,
  createDepartment,
  updateDepartment,
  getAuditLogs,
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validateRequestMiddleware from "../middleware/validateRequest.js";

const router = express.Router();

// Admin dashboard (both admin and super_admin can access)
router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware(["admin", "super_admin"]),
  getDashboard
);

// Delete user
router.delete(
  "/user/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteUser
);

// Create announcement
router.post(
  "/announcement",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("content").notEmpty().withMessage("Content is required"),
  ],
  authMiddleware,
  roleMiddleware(["admin"]),
  validateRequestMiddleware,
  createAnnouncement
);

// User management (both admin and super_admin can access)
router.get("/users", authMiddleware, roleMiddleware(["admin", "super_admin"]), getUsers);
router.put("/users/:id/role", authMiddleware, roleMiddleware(["admin", "super_admin"]), updateUserRole);
router.put("/users/:id/status", authMiddleware, roleMiddleware(["admin", "super_admin"]), updateUserStatus);
router.put("/users/:id/verify-aadhaar", authMiddleware, roleMiddleware(["admin", "super_admin"]), verifyAadhaar);

// Department management (both admin and super_admin can access)
router.post("/departments", authMiddleware, roleMiddleware(["admin", "super_admin"]), createDepartment);
router.put("/departments/:id", authMiddleware, roleMiddleware(["admin", "super_admin"]), updateDepartment);

// Audit logs (both admin and super_admin can access)
router.get("/audit-logs", authMiddleware, roleMiddleware(["admin", "super_admin"]), getAuditLogs);

export default router;

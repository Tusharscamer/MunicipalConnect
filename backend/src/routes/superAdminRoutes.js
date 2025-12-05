// routes/superAdminRoutes.js
import express from "express";
import {
  createDepartmentHead,
  createTeam,
  addTeamLeader,
  addTeamMember,
  moveStaffBetweenDepartments,
  removeOrDisableStaff,
  enableStaff,
  updateStaffDetails,
  resetPassword,
  getAllStaff,
  getAllTeams,
  getAllDepartments,
  updateTeamBySuperAdmin,
  deleteTeamBySuperAdmin,
} from "../controllers/superAdminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes require super_admin role
router.use(authMiddleware);
router.use(roleMiddleware(["super_admin"]));

// Get all data
router.get("/staff", getAllStaff);
router.get("/teams", getAllTeams);
router.get("/departments", getAllDepartments);

// Create operations
router.post("/create-dept-head", createDepartmentHead);
router.post("/create-team", createTeam);
router.post("/add-team-leader", addTeamLeader);
router.post("/add-team-member", addTeamMember);

// Management operations
router.put("/move-staff/:userId", moveStaffBetweenDepartments);
router.delete("/remove-staff/:userId", removeOrDisableStaff);
router.put("/enable-staff/:userId", enableStaff);
router.put("/update-staff/:userId", updateStaffDetails);
router.put("/reset-password/:userId", resetPassword);

// Team management (Super Admin)
router.put("/teams/:teamId", updateTeamBySuperAdmin);
router.delete("/teams/:teamId", deleteTeamBySuperAdmin);

export default router;


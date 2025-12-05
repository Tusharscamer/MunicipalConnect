import express from "express";
import {
  getDepartmentMembers,
  createTeam,
  getMyTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  reassignTeamLeader,
  getDepartmentTeams,
  getMyTeamInfo,
} from "../controllers/teamController.js";
import { getRecommendedMembers } from "../controllers/recommendationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get department members (for team leaders and dept heads to see available workers)
router.get("/departments/:departmentId/members", authMiddleware, getDepartmentMembers);

// Get all teams in department (Department Head only)
router.get("/departments/teams", authMiddleware, roleMiddleware(["dept_head"]), getDepartmentTeams);

// Get recommended team members for a task
router.get("/recommendations/:teamId", authMiddleware, roleMiddleware(["team_leader"]), getRecommendedMembers);

// Team CRUD operations
router.post("/", authMiddleware, roleMiddleware(["team_leader", "dept_head"]), createTeam);
router.get("/my-teams", authMiddleware, roleMiddleware(["team_leader"]), getMyTeams);
router.get("/my-team-info", authMiddleware, roleMiddleware(["team_member"]), getMyTeamInfo);
router.get("/:id", authMiddleware, getTeamById);
router.put("/:id", authMiddleware, roleMiddleware(["team_leader", "dept_head"]), updateTeam);
router.put("/:id/reassign-leader", authMiddleware, roleMiddleware(["dept_head"]), reassignTeamLeader);
router.delete("/:id", authMiddleware, roleMiddleware(["team_leader"]), deleteTeam);

export default router;


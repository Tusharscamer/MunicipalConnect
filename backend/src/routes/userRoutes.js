import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  loginUser,
  updateTeamMemberProfile,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.post("/login", loginUser);
// Update team member profile (skills, availability, shift timing)
router.put("/:id/profile", authMiddleware, roleMiddleware(["team_member", "team_leader", "dept_head"]), updateTeamMemberProfile);

export default router;

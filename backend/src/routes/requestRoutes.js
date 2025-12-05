import express from "express";
import {
  getPublicRequests,
  getPublicRequestById,
  getRequests,
  getRequestById,
  findSimilarRequests,
  supportRequest,
  validateRequest,
  assignTeamLeader,
  addTask,
  updateTaskStatus,
  submitCompletion,
  verifyCompletion,
  mergeRequests,
  addCitizenFeedback,
  createRequest,
  updateRequestStatus,
  deleteRequest,
} from "../controllers/requestController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

// Public routes - no auth required
router.get("/public", getPublicRequests);
router.get("/public/:id", getPublicRequestById);

// Protected routes - require auth
router.get("/", authMiddleware, getRequests);
router.post("/similar", authMiddleware, findSimilarRequests);
router.get("/:id", authMiddleware, getRequestById);
router.post("/:id/support", authMiddleware, supportRequest);
router.post("/:id/validate", authMiddleware, roleMiddleware(["dept_head"]), validateRequest);
router.post("/:id/assign", authMiddleware, roleMiddleware(["dept_head"]), assignTeamLeader);
router.post("/:id/tasks", authMiddleware, roleMiddleware(["team_leader"]), addTask);
router.patch("/:id/tasks/:taskId", authMiddleware, roleMiddleware(["team_leader", "team_member"]), updateTaskStatus);
router.post(
  "/:id/completion",
  authMiddleware,
  roleMiddleware(["team_leader"]),
  upload.array("evidence", 5),
  submitCompletion
);
router.post("/:id/verify", authMiddleware, roleMiddleware(["dept_head"]), verifyCompletion);
router.post("/merge", authMiddleware, roleMiddleware(["dept_head"]), mergeRequests);
router.post("/:id/feedback", authMiddleware, roleMiddleware(["citizen"]), addCitizenFeedback);
router.post("/", authMiddleware, upload.single("attachment"), createRequest);
router.put("/:id/status", authMiddleware, updateRequestStatus);
router.delete("/:id", authMiddleware, deleteRequest);

export default router;

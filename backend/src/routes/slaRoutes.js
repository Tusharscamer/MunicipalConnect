import express from "express";
import {
  checkRequestSLA,
  getSLABreaches,
  getSLAHours,
} from "../controllers/slaController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Check SLA for a specific request
router.get("/request/:requestId", authMiddleware, checkRequestSLA);

// Get all SLA breaches (Department Head only)
router.get("/breaches", authMiddleware, roleMiddleware(["dept_head"]), getSLABreaches);

// Get SLA hours for a category
router.get("/hours", authMiddleware, getSLAHours);

export default router;


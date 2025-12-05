import express from "express";
import {
  getDepartmentAnalytics,
  getReports,
  getHeatmap,
  getSLABreachReport,
  getTeamRanking,
} from "../controllers/analyticsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Department Head analytics
router.get("/department", authMiddleware, roleMiddleware(["dept_head"]), getDepartmentAnalytics);

// Reports (available to dept_head and admin)
router.get("/reports", authMiddleware, roleMiddleware(["dept_head", "admin"]), getReports);

// Heatmap (GIS data)
router.get("/heatmap", authMiddleware, roleMiddleware(["dept_head", "admin"]), getHeatmap);

// SLA breach report
router.get("/sla-breaches", authMiddleware, roleMiddleware(["dept_head", "admin"]), getSLABreachReport);

// Team performance ranking
router.get("/team-ranking", authMiddleware, roleMiddleware(["dept_head", "admin"]), getTeamRanking);

export default router;


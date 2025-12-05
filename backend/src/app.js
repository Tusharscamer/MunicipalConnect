import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import "express-async-errors"; // handle async errors
import authRoutes from "./routes/authRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import slaRoutes from "./routes/slaRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Basic middlewares
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/sla", slaRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/users", userRoutes);

// health
app.get("/health", (req, res) => res.json({ status: "ok", env: process.env.NODE_ENV }));

// Error handler (must be last)
app.use(errorHandler);

export default app;

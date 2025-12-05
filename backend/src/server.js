// backend/src/server.js
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import app from "./app.js"; // application-level router + middleware

import complaintRoutes from "./routes/complaintRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

// Connect DB first
connectDB();

// Mount additional routes not present in app.js (these are legacy routes, main routes are in app.js)
app.use("/api/complaints", complaintRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/tasks", taskRoutes);

// root
app.get("/", (req, res) => {
  res.json({ message: "MunicipalConnect API running", env: process.env.NODE_ENV || "development" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

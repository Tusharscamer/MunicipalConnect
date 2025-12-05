// Seed default departments including a generic 'General'
// Usage: from backend directory run: npm run seed:departments

import dotenv from "dotenv";
import mongoose from "mongoose";
import Department from "../models/Department.js";

dotenv.config();

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const defaults = [
    { name: "General", contact: "155303", slaHours: 72 },
    { name: "Roads & Potholes", contact: "1800-000-001", slaHours: 72 },
    { name: "Streetlights", contact: "1800-000-002", slaHours: 72 },
    { name: "Water Supply", contact: "1800-000-003", slaHours: 72 },
    { name: "Sanitation & Solid Waste", contact: "1800-000-004", slaHours: 72 },
  ];

  for (const dept of defaults) {
    const existing = await Department.findOne({ name: dept.name });
    if (existing) {
      console.log(`Department '${dept.name}' already exists, skipping.`);
      continue;
    }
    const created = await Department.create(dept);
    console.log(`Created department '${created.name}' (id=${created._id})`);
  }

  await mongoose.disconnect();
  console.log("Done seeding departments.");
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});



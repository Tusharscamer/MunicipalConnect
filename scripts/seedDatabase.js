// Simple seeder to add default departments (including a generic 'General' one)
// Run from project root with:
//   node scripts/seedDatabase.js

import mongoose from "mongoose";
import Department from "../backend/src/models/Department.js";
import * as url from "url";
import path from "path";

// Manually load .env without relying on dotenv as an ESM package in this script.
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../backend/.env");
await (async () => {
  try {
    const fs = await import("fs");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .forEach((line) => {
          const [key, ...rest] = line.split("=");
          const value = rest.join("=").trim();
          if (!process.env[key]) process.env[key] = value;
        });
    }
  } catch (e) {
    console.warn("Could not preload .env, make sure MONGO_URI is set.", e);
  }
})();

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set in backend/.env");
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
  console.log("Done.");
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});



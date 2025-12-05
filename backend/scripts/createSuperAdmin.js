// scripts/createSuperAdmin.js
// Run this script to create the initial Super Admin account
// Usage: node scripts/createSuperAdmin.js

import mongoose from "mongoose";
import User from "../src/models/User.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "superadmin@municipalconnect.gov";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin@2024";
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || "Super Administrator";

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    // Prefer the same env var used by the main app (MONGO_URI),
    // fall back to MONGODB_URI and finally to local Mongo.
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/municipalconnect";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ 
      $or: [
        { email: SUPER_ADMIN_EMAIL },
        { role: "super_admin" }
      ]
    });

    if (existingSuperAdmin) {
      console.log("⚠️  Super Admin already exists!");
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Role: ${existingSuperAdmin.role}`);
      console.log("\n📋 Login Credentials:");
      console.log(`   Email: ${SUPER_ADMIN_EMAIL}`);
      console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);

    // Create super admin
    const superAdmin = await User.create({
      name: SUPER_ADMIN_NAME,
      email: SUPER_ADMIN_EMAIL.toLowerCase(),
      username: SUPER_ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: "super_admin",
      isActive: true,
    });

    console.log("✅ Super Admin created successfully!");
    console.log("\n📋 Login Credentials:");
    console.log(`   Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");
    console.log("\n📝 User Details:");
    console.log(`   ID: ${superAdmin._id}`);
    console.log(`   Name: ${superAdmin.name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Role: ${superAdmin.role}`);

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error creating Super Admin:", error.message);
    if (error.code === 11000) {
      console.error("   A user with this email already exists!");
    }
    process.exit(1);
  }
}

// Run the script
createSuperAdmin();


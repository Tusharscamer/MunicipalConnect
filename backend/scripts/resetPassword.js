// scripts/resetPassword.js
// Reset password for a user
// Usage: node scripts/resetPassword.js "email@example.com" "newPassword"

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

const EMAIL = process.argv[2];
const NEW_PASSWORD = process.argv[3];

async function resetPassword() {
  try {
    if (!EMAIL || !NEW_PASSWORD) {
      console.log("❌ Usage: node scripts/resetPassword.js \"email@example.com\" \"newPassword\"");
      process.exit(1);
    }

    if (NEW_PASSWORD.length < 6) {
      console.log("❌ Password must be at least 6 characters long");
      process.exit(1);
    }

    // Connect to MongoDB
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/municipalconnect";
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Find user
    const normalizedEmail = EMAIL.toLowerCase().trim();
    console.log(`🔍 Searching for user with email: ${normalizedEmail}`);
    
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log("❌ User not found!");
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log("✅ User found:", user.name);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}\n`);

    // Hash new password
    console.log("🔐 Hashing new password...");
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
    
    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log("✅ Password reset successfully!");
    console.log(`\n📋 New Login Credentials:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
    console.log(`\n⚠️  Please login and change your password after first login!`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

resetPassword();


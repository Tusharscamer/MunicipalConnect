import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../backend/src/models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../backend/.env") });

const EMAIL_TO_CHECK = process.argv[2] || "tushardhakad355@gmail.com";
const PASSWORD_TO_CHECK = process.argv[3] || "";

async function checkUser() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/municipalconnect";
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Find user
    const normalizedEmail = EMAIL_TO_CHECK.toLowerCase().trim();
    console.log(`🔍 Searching for user with email: ${normalizedEmail}`);
    
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log("❌ User not found!");
      console.log("\n📋 Available users in database:");
      const allUsers = await User.find({}, "name email role isActive").limit(10);
      if (allUsers.length === 0) {
        console.log("   No users found in database.");
      } else {
        allUsers.forEach((u, i) => {
          console.log(`   ${i + 1}. ${u.name} (${u.email}) - ${u.role} - Active: ${u.isActive}`);
        });
      }
      await mongoose.disconnect();
      return;
    }

    console.log("✅ User found!");
    console.log("\n📋 User Details:");
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Has Password: ${!!user.password}`);
    console.log(`   Password Hash: ${user.password ? user.password.substring(0, 20) + "..." : "N/A"}`);

    if (PASSWORD_TO_CHECK) {
      console.log("\n🔐 Testing password...");
      if (!user.password) {
        console.log("❌ User has no password set!");
      } else {
        const isValid = await bcrypt.compare(PASSWORD_TO_CHECK, user.password);
        if (isValid) {
          console.log("✅ Password is CORRECT!");
        } else {
          console.log("❌ Password is INCORRECT!");
        }
      }
    } else {
      console.log("\n💡 To test password, run:");
      console.log(`   node scripts/checkUser.js "${EMAIL_TO_CHECK}" "your_password"`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkUser();


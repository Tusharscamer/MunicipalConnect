// controllers/authenticationController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as otpService from "../services/otpService.js";

const selfAssignableRoles = ["citizen", "dept_head", "team_leader", "team_member"];

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, role, departmentId, managerId, aadhaarNumber, otp } = req.body;
    
    // Only citizens can self-register; staff accounts (dept_head, team_leader, team_member) are created by admin
    // If someone tries to register as staff, force them to be citizen
    let normalizedRole = "citizen";
    if (role === "citizen") {
      normalizedRole = "citizen";
    } else {
      // Staff roles cannot self-register
      return res.status(403).json({ 
        message: "Staff accounts (Department Head, Team Leader, Team Member) must be created by Admin. Please register as a Citizen." 
      });
    }
    
    // If phone OTP is provided, verify it
    if (phone && otp) {
      const otpValid = otpService.verifyOTP(phone, otp);
      if (!otpValid) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const normalizedEmail = email?.toLowerCase().trim();
    const user = await User.create({
      name,
      email: normalizedEmail,
      username: normalizedEmail,
      phone,
      phoneVerified: otp ? true : false,
      role: normalizedRole,
      password: hashed,
      department: departmentId || undefined,
      manager: managerId || undefined,
      aadhaarNumber: aadhaarNumber || undefined,
      aadhaarVerified: aadhaarNumber ? false : undefined, // Requires admin verification
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return res.status(409).json({ message: `${field} already exists` });
    }
    console.error("Register error:", error);
    res.status(500).json({ message: "Failed to register user" });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("[LOGIN] Attempt:", { email: email ? email.substring(0, 10) + "..." : "missing", hasPassword: !!password });
    
    if (!email || !password) {
      console.log("[LOGIN] Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email (case-insensitive)
    const normalizedEmail = email.toLowerCase().trim();
    console.log("[LOGIN] Searching for email:", normalizedEmail);
    
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      console.log("[LOGIN] User not found for email:", normalizedEmail);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("[LOGIN] User found:", { 
      id: user._id, 
      email: user.email, 
      role: user.role, 
      isActive: user.isActive,
      hasPassword: !!user.password 
    });

    // Check if user account is disabled
    if (user.isActive === false) {
      console.log("[LOGIN] Account disabled");
      return res.status(403).json({ message: "Your account has been disabled. Please contact your administrator." });
    }

    // Check if password exists
    if (!user.password) {
      console.error(`[LOGIN] User ${user.email} has no password set`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("[LOGIN] Comparing password...");
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      console.log("[LOGIN] Password comparison failed");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("[LOGIN] Password valid, generating token...");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    console.log("[LOGIN] Login successful for:", user.email);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        manager: user.manager,
      },
    });
  } catch (error) {
    console.error("[LOGIN] Error:", error);
    res.status(500).json({ message: "Failed to login" });
  }
};

export const getProfile = async (req, res) => {
  // user info comes from authMiddleware
  res.json({
    id: req.user._id,
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    phoneVerified: req.user.phoneVerified,
    role: req.user.role,
    department: req.user.department,
    manager: req.user.manager,
    aadhaarVerified: req.user.aadhaarVerified,
    isActive: req.user.isActive,
  });
};

/**
 * Send OTP to phone number
 * POST /api/auth/send-otp
 */
export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const otp = otpService.generateOTP();
    const sent = await otpService.sendOTP(phone, otp);
    
    if (sent) {
      res.json({ message: "OTP sent successfully", phone });
    } else {
      res.status(500).json({ message: "Failed to send OTP" });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/**
 * Verify OTP
 * POST /api/auth/verify-otp
 */
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    const isValid = otpService.verifyOTP(phone, otp);
    if (isValid) {
      // Update user's phone verification status if user exists
      const user = await User.findOne({ phone });
      if (user) {
        user.phoneVerified = true;
        await user.save();
      }
      res.json({ message: "OTP verified successfully", verified: true });
    } else {
      res.status(400).json({ message: "Invalid or expired OTP", verified: false });
    }
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

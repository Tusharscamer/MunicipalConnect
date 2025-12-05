import express from "express";
import { body } from "express-validator";
import {
  registerUser,
  loginUser,
  getProfile,
  sendOTP,
  verifyOTP
} from "../controllers/authController.js"; // your controller file name
import { updateMyProfile } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

// Middleware to validate request input
const validate = (req, res, next) => {
  const errors = req.validationErrors?.();
  if (errors && errors.length > 0) {
    return res.status(400).json({ message: errors[0].msg });
  }
  next();
};

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("phone").trim().notEmpty().withMessage("Phone number is required"),
    body("password")
      .isLength({ min: 4 })
      .withMessage("Password must be at least 4 characters long"),
  ],
  (req, res, next) => {
    // collect validation errors manually
    const errors = [];
    if (!req.body.name) errors.push({ msg: "Name is required" });
    if (!req.body.email) errors.push({ msg: "Valid email required" });
    if (!req.body.phone) errors.push({ msg: "Phone number is required" });
    if (!req.body.password || req.body.password.length < 4)
      errors.push({ msg: "Password must be at least 4 characters" });

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0].msg });
    }

    next();
  },
  registerUser
);

/**
 * @route   POST /api/auth/login
 * @desc    Login existing user
 * @access  Public
 */
router.post(
  "/login",
  (req, res, next) => {
    // Simple validation - let the controller handle detailed checks
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Valid email required" });
    }
    next();
  },
  loginUser
);

/**
 * @route   GET /api/auth/me
 * @desc    Get profile of logged-in user
 * @access  Private
 */
router.get("/me", authMiddleware, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update logged-in user's profile (name, email, phone)
 * @access  Private
 */
router.put("/profile", authMiddleware, updateMyProfile);

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to phone number
 * @access  Public
 */
router.post("/send-otp", sendOTP);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP
 * @access  Public
 */
router.post("/verify-otp", verifyOTP);

export default router;

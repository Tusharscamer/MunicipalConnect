import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, index: true, unique: true, lowercase: true, trim: true },
  // Optional internal username; we default it to email when creating staff/admins
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  phoneVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiresAt: { type: Date },
  aadhaarNumber: { type: String, sparse: true, unique: true }, // Optional Aadhaar eKYC
  aadhaarVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }, // For admin to disable users
  role: {
    type: String,
    enum: ["citizen", "dept_head", "team_leader", "team_member", "admin", "super_admin"],
    default: "citizen"
  },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // e.g. team_leader for team_member
  password: { type: String, required: true },
  address: { type: String },
  cityZone: { type: String },
  // Team member specific fields
  skills: [{ type: String }], // e.g., ["plumber", "electrician", "cleaner"]
  availability: {
    status: { type: String, enum: ["available", "busy", "unavailable"], default: "available" },
    until: Date, // when availability changes (for busy/unavailable)
  },
  shiftTiming: {
    start: String, // e.g., "09:00"
    end: String, // e.g., "17:00"
    days: [{ type: String }], // e.g., ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  },
  createdAt: { type: Date, default: Date.now }
});
 
// instance method to compare password
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// static helper to create
userSchema.statics.createUser = async function ({
  name,
  email,
  phone,
  password,
  role = "citizen",
  address,
  cityZone,
}) {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const normalizedEmail = email?.toLowerCase();
  return this.create({
    name,
    email: normalizedEmail,
    username: normalizedEmail,
    phone,
    role,
    password: passwordHash,
    address,
    cityZone,
  });
};

const User = mongoose.model("User", userSchema);
export default User;

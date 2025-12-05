import User from "../models/User.js";

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get one user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new user
export const createUser = async (req, res) => {
  try {
    const user = await User.createUser(req.body);
    res.status(201).json({ message: "User created", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Login (basic)
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user profile (personal info - name, email, phone) - ONLY CITIZENS can update their own
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, phone } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only citizens can edit their own profile
    if (user.role !== "citizen") {
      return res.status(403).json({ 
        message: "You do not have permission to edit your profile. Only citizens can edit their own profiles. Please contact your administrator for profile changes." 
      });
    }

    // Check if email is being changed and if it's already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(409).json({ message: "Email already in use by another account" });
      }
      user.email = email.toLowerCase();
      // Update username to match email if username was based on email
      if (user.username === user.email) {
        user.username = email.toLowerCase();
      }
    }

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(userId).select("-password");
    res.json({ 
      message: "Profile updated successfully", 
      user: updatedUser 
    });
  } catch (err) {
    console.error("Update profile error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }
    res.status(400).json({ message: err.message || "Failed to update profile" });
  }
};

// Update team member profile (skills, availability, shift timing)
export const updateTeamMemberProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { skills, availability, shiftTiming } = req.body;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only team members can update their own profile, or team leaders/dept heads can update their members
    if (req.user.role === "team_member" && req.user._id.toString() !== id) {
      return res.status(403).json({ message: "You can only update your own profile" });
    }

    if (user.role !== "team_member") {
      return res.status(400).json({ message: "This endpoint is only for team members" });
    }

    if (skills !== undefined) {
      user.skills = Array.isArray(skills) ? skills : [];
    }

    if (availability !== undefined) {
      user.availability = {
        status: availability.status || user.availability?.status || "available",
        until: availability.until ? new Date(availability.until) : user.availability?.until,
      };
    }

    if (shiftTiming !== undefined) {
      user.shiftTiming = {
        start: shiftTiming.start || user.shiftTiming?.start,
        end: shiftTiming.end || user.shiftTiming?.end,
        days: Array.isArray(shiftTiming.days) ? shiftTiming.days : user.shiftTiming?.days || [],
      };
    }

    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
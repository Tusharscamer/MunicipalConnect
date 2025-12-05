import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // team_leader
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // team_members
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

teamSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Team", teamSchema);


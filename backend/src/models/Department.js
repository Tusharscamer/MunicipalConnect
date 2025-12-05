import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  contact: { type: String },
  slaHours: { type: Number, default: 72 }, // default SLA in hours
  // SLA per category/service type (in hours)
  categorySLA: {
    type: Map,
    of: Number,
    default: {}
  },
  head: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  teamLeaders: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Department", departmentSchema);

import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true },
  dept: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["open","in_progress","done","blocked"], default: "open" },
  dueDate: { type: Date },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Task", taskSchema);

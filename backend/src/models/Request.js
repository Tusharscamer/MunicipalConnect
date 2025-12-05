import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  address: String
}, { _id: false });

const TASK_STATUS = ["todo", "in_progress", "blocked", "completed"];

const taskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // legacy support
    assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" }, // new: assign to team
    assignedMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // individual team members assigned
    status: { type: String, enum: TASK_STATUS, default: "todo" },
    estimatedTime: Number, // estimated time in hours
    requiredWorkers: Number, // number of workers required
    deadline: Date, // task deadline
    instructions: String, // detailed instructions for team members
    attachments: [String],
    notes: String,
    startedAt: Date,
    completedAt: Date,
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who marked it done
    reportSubmitted: { type: Boolean, default: false }, // whether completion report has been submitted
    reportSubmittedAt: Date, // when report was submitted
    reportStatus: { type: String, enum: ["pending", "accepted", "rejected"] }, // department head's decision on the report (optional, set when report is submitted/reviewed)
    reportReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // department head who reviewed
    reportReviewedAt: Date, // when report was reviewed
    reportReviewNotes: String, // notes from department head
  },
  { _id: true }
);

const requestSchema = new mongoose.Schema({
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  serviceType: { type: String, required: true },
  description: { type: String },
  location: { type: locationSchema },
  attachmentUrl: { type: String },
  attachments: [String],
  status: {
    type: String,
    enum: [
      "submitted",
      "validating",
      "pending_assignment",
      "assigned",
      "working",
      "completed_on_site",
      "in_review",
      "rework_required",
      "completed",
      "closed",
      "invalid",
      "merged"
    ],
    default: "submitted"
  },
  validationStatus: { type: String, enum: ["pending", "valid", "invalid"], default: "pending" },
  priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // team leader
  assignment: {
    teamLeader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedAt: Date,
    deadline: Date,
    notes: String,
  },
  // Time logs for tracking request lifecycle
  timeLogs: {
    created: { type: Date, default: function() { return this.createdAt || new Date(); } },
    validated: Date,
    assigned: Date,
    workingStart: Date,
    completed: Date,
    verified: Date,
  },
  // Cost estimate by Team Leader
  costEstimate: Number,
  // SLA escalation tracking
  escalated: { type: Boolean, default: false },
  escalatedAt: Date,
  escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tasks: [taskSchema],
  supporters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  supportCount: { type: Number, default: 0 },
  parentRequest: { type: mongoose.Schema.Types.ObjectId, ref: "Request" },
  mergedChildren: [{ type: mongoose.Schema.Types.ObjectId, ref: "Request" }],
  validationHistory: [
    {
      status: { type: String, enum: ["pending", "valid", "invalid"] },
      by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      notes: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  history: [
    {
      status: String,
      by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      message: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  completion: {
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    submittedAt: Date,
    timeTakenHours: Number,
    costIncurred: Number,
    materialsUsed: String, // materials used for the work
    memberNames: [String],
    evidence: [String], // images and videos
    notes: String,
  },
  verification: {
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date,
    notes: String,
  },
  citizenFeedback: {
    comment: String,
    rating: Number,
    createdAt: Date,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

requestSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Request", requestSchema);

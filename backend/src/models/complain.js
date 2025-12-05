import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // each complaint must belong to a user
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Water",
        "Electricity",
        "Roads",
        "Garbage",
        "Street Lights",
        "Drainage",
        "Other",
      ], // adjust categories as per your use case
    },
    description: {
      type: String,
      required : true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    images: [
      {
        type: String, // store file URLs or filenames
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // automatically manages createdAt and updatedAt
  }
);

// middleware to auto-update `updatedAt`
complaintSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;

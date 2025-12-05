import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: "Request" },
  amount: { type: Number, required: true },
  gateway: { type: String },
  transactionId: { type: String },
  status: { type: String, enum: ["pending","success","failed"], default: "pending" },
  meta: { type: Object },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Payment", paymentSchema);

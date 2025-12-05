import Payment from "../models/Payment.js";

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("request", "serviceType citizen")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  const { status, transactionId } = req.body;
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status, transactionId },
      { new: true }
    );
    res.json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

import Razorpay from "razorpay";
import express from "express";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_RBJQ1I0Gt91gCd",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "NGRZzdXTGAjH4mcBlk22Yd7D",
});

// Create Razorpay order
router.post("/create-razorpay-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt = "rcptid_11" } = req.body;
    const options = {
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency,
      receipt,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to create Razorpay order", error });
  }
});

export default router;

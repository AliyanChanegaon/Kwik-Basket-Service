import express from "express";
import { supabase } from "../server";
import { authMiddleware } from "../middleware/auth";
import Razorpay from "razorpay";
import crypto from "crypto";

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "YOUR_KEY_ID",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET",
});

// Create payment intent
router.post("/create",  async (req: any, res) => {
  try {
    const { order_id, provider } = req.body;

    // Get order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();
    if (orderError) throw orderError;

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        order_id,
        provider,
        status: "pending",
      })
      .select()
      .single();
    if (paymentError) throw paymentError;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.total_amount * 100), // in paise
      currency: "INR", // change to USD if needed
      receipt: `receipt_${payment.id}`,
      payment_capture: true, // auto capture
    });

    // Return Razorpay order info to frontend
    res.json({
      payment_id: payment.id,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("[v0] Create payment error:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

// Verify payment
router.post("/verify", async (req: any, res) => {
  try {
    const { payment_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature)
      return res.status(400).json({ error: "Invalid signature" });

    // Update payment status
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .update({
        transaction_id: razorpay_payment_id,
        status: "completed",
      })
      .eq("id", payment_id)
      .select()
      .single();
    if (paymentError) throw paymentError;

    // Update order status
    await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
      })
      .eq("id", payment.order_id);

    res.json({ message: "Payment verified successfully" });
  } catch (error) {
    console.error("[v0] Verify payment error:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

export default router;

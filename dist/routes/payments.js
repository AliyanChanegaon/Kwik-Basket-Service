"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Create payment intent
router.post("/create", auth_1.authMiddleware, async (req, res) => {
    try {
        const { order_id, provider } = req.body;
        // Get order
        const { data: order, error: orderError } = await server_1.supabase.from("orders").select("*").eq("id", order_id).single();
        if (orderError)
            throw orderError;
        // Create payment record
        const { data: payment, error: paymentError } = await server_1.supabase
            .from("payments")
            .insert({
            order_id,
            provider,
            status: "pending",
        })
            .select()
            .single();
        if (paymentError)
            throw paymentError;
        // Here you would integrate with Razorpay/Stripe
        // For now, return mock payment intent
        res.json({
            payment_id: payment.id,
            amount: order.total_amount,
            currency: "USD",
        });
    }
    catch (error) {
        console.error("[v0] Create payment error:", error);
        res.status(500).json({ error: "Failed to create payment" });
    }
});
// Verify payment
router.post("/verify", auth_1.authMiddleware, async (req, res) => {
    try {
        const { payment_id, transaction_id } = req.body;
        // Update payment status
        const { data: payment, error: paymentError } = await server_1.supabase
            .from("payments")
            .update({
            transaction_id,
            status: "completed",
        })
            .eq("id", payment_id)
            .select()
            .single();
        if (paymentError)
            throw paymentError;
        // Update order status
        await server_1.supabase
            .from("orders")
            .update({
            payment_status: "paid",
            status: "confirmed",
        })
            .eq("id", payment.order_id);
        res.json({ message: "Payment verified successfully" });
    }
    catch (error) {
        console.error("[v0] Verify payment error:", error);
        res.status(500).json({ error: "Failed to verify payment" });
    }
});
exports.default = router;

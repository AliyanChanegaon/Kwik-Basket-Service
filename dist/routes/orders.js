"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get user orders
router.get("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const { data, error } = await server_1.supabase
            .from("orders")
            .select("*, order_items(*, products(*))")
            .eq("user_id", req.supabaseUser.id)
            .order("created_at", { ascending: false });
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error("[v0] Get orders error:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});
// Get single order
router.get("/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        const { data, error } = await server_1.supabase
            .from("orders")
            .select("*, order_items(*, products(*))")
            .eq("id", req.params.id)
            .eq("user_id", req.supabaseUser.id)
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error("[v0] Get order error:", error);
        res.status(404).json({ error: "Order not found" });
    }
});
// Cancel order
router.put("/:id/cancel", auth_1.authMiddleware, async (req, res) => {
    try {
        const { data, error } = await server_1.supabase
            .from("orders")
            .update({ status: "cancelled" })
            .eq("id", req.params.id)
            .eq("user_id", req.supabaseUser.id)
            .eq("status", "pending")
            .select()
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error("[v0] Cancel order error:", error);
        res.status(500).json({ error: "Failed to cancel order" });
    }
});
exports.default = router;

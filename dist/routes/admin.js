"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all orders (Admin only)
router.get("/orders", auth_1.authMiddleware, async (req, res) => {
    try {
        const { data, error } = await server_1.supabase
            .from("orders")
            .select("*, order_items(*, products(*)), users(*)")
            .order("created_at", { ascending: false });
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error("[v0] Get admin orders error:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});
// Update order status (Admin only)
router.put("/orders/:id/status", auth_1.authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const { data, error } = await server_1.supabase.from("orders").update({ status }).eq("id", req.params.id).select().single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error("[v0] Update order status error:", error);
        res.status(500).json({ error: "Failed to update order status" });
    }
});
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get current user profile
router.get("/me", auth_1.authMiddleware, async (req, res) => {
    try {
        const { data, error } = await server_1.supabase.from("users").select("*").eq("id", req.supabaseUser.id).single();
        if (error)
            throw error;
        res.json(data || req.supabaseUser);
    }
    catch (error) {
        console.error("[v0] Get user error:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});
// Update user profile
router.put("/me", auth_1.authMiddleware, async (req, res) => {
    try {
        const { data, error } = await server_1.supabase
            .from("users")
            .update(req.body)
            .eq("id", req.supabaseUser.id)
            .select()
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error("[v0] Update user error:", error);
        res.status(500).json({ error: "Failed to update user" });
    }
});
exports.default = router;

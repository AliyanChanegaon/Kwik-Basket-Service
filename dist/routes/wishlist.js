"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get wishlist
router.get("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const { data, error } = await server_1.supabase.from("wishlist").select("*, products(*)").eq("user_id", req.supabaseUser.id);
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error("[v0] Get wishlist error:", error);
        res.status(500).json({ error: "Failed to fetch wishlist" });
    }
});
// Add to wishlist
router.post("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const { product_id } = req.body;
        const { data, error } = await server_1.supabase
            .from("wishlist")
            .insert({
            user_id: req.supabaseUser.id,
            product_id,
        })
            .select()
            .single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        console.error("[v0] Add to wishlist error:", error);
        res.status(500).json({ error: "Failed to add to wishlist" });
    }
});
// Remove from wishlist
router.delete("/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        const { error } = await server_1.supabase
            .from("wishlist")
            .delete()
            .eq("id", req.params.id)
            .eq("user_id", req.supabaseUser.id);
        if (error)
            throw error;
        res.json({ message: "Removed from wishlist" });
    }
    catch (error) {
        console.error("[v0] Remove from wishlist error:", error);
        res.status(500).json({ error: "Failed to remove from wishlist" });
    }
});
exports.default = router;

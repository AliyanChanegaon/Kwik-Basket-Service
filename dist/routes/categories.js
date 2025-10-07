"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all categories
router.get("/", async (req, res) => {
    try {
        const { data, error } = await server_1.supabase.from("categories").select("*").order("name");
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error("[v0] Get categories error:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});
// Create category (Admin only)
router.post("/", auth_1.authMiddleware, async (req, res) => {
    try {
        const { data, error } = await server_1.supabase.from("categories").insert(req.body).select().single();
        if (error)
            throw error;
        res.status(201).json(data);
    }
    catch (error) {
        console.error("[v0] Create category error:", error);
        res.status(500).json({ error: "Failed to create category" });
    }
});
// Update category (Admin only)
router.put("/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        const { data, error } = await server_1.supabase.from("categories").update(req.body).eq("id", req.params.id).select().single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error("[v0] Update category error:", error);
        res.status(500).json({ error: "Failed to update category" });
    }
});
// Delete category (Admin only)
router.delete("/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        const { error } = await server_1.supabase.from("categories").delete().eq("id", req.params.id);
        if (error)
            throw error;
        res.json({ message: "Category deleted successfully" });
    }
    catch (error) {
        console.error("[v0] Delete category error:", error);
        res.status(500).json({ error: "Failed to delete category" });
    }
});
exports.default = router;

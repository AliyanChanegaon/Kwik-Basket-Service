"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Verify token
router.post("/verify", auth_1.authMiddleware, async (req, res) => {
    try {
        res.json({ user: req.supabaseUser });
    }
    catch (error) {
        console.error("[v0] Verify error:", error);
        res.status(500).json({ error: "Verification failed" });
    }
});
// Logout
router.post("/logout", auth_1.authMiddleware, async (req, res) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (token) {
            await server_1.supabase.auth.signOut();
        }
        res.json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error("[v0] Logout error:", error);
        res.status(500).json({ error: "Logout failed" });
    }
});
exports.default = router;

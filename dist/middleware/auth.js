"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const server_1 = require("../server");
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }
        const { data: { user }, error, } = await server_1.supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: "Invalid token" });
        }
        req.supabaseUser = user;
        next();
    }
    catch (error) {
        console.error("[v0] Auth middleware error:", error);
        res.status(500).json({ error: "Authentication failed" });
    }
};
exports.authMiddleware = authMiddleware;
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (token) {
            const { data: { user }, } = await server_1.supabase.auth.getUser(token);
            if (user) {
                req.supabaseUser = user;
            }
        }
        next();
    }
    catch (error) {
        console.error("[v0] Optional auth middleware error:", error);
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAnonCart = exports.createAnonCart = exports.anonCartMiddleware = void 0;
const uuid_1 = require("uuid");
const anonCartMiddleware = (req, res, next) => {
    try {
        const cookieId = req.signedCookies.kb_anon_cart;
        if (cookieId) {
            req.anonCartId = cookieId;
        }
        next();
    }
    catch (error) {
        console.error("[v0] Anon cart middleware error:", error);
        next();
    }
};
exports.anonCartMiddleware = anonCartMiddleware;
const createAnonCart = (res) => {
    const cartId = (0, uuid_1.v4)();
    res.cookie("kb_anon_cart", cartId, {
        signed: true,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return cartId;
};
exports.createAnonCart = createAnonCart;
const clearAnonCart = (res) => {
    res.clearCookie("kb_anon_cart");
};
exports.clearAnonCart = clearAnonCart;

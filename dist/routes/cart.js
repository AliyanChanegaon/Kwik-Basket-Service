"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const auth_1 = require("../middleware/auth");
const anonCart_1 = require("../middleware/anonCart");
const router = express_1.default.Router();
// Get cart
router.get("/", auth_1.optionalAuthMiddleware, anonCart_1.anonCartMiddleware, async (req, res) => {
    try {
        if (req.supabaseUser) {
            // Get user cart
            const { data: cart, error: cartError } = await server_1.supabase
                .from("carts")
                .select("*, cart_items(*, products(*))")
                .eq("user_id", req.supabaseUser.id)
                .single();
            if (cartError && cartError.code !== "PGRST116")
                throw cartError;
            res.json(cart || { cart_items: [] });
        }
        else if (req.anonCartId) {
            // Get anonymous cart
            const { data: anonCart, error } = await server_1.supabase
                .from("anonymous_carts")
                .select("*")
                .eq("cookie_id", req.anonCartId)
                .single();
            if (error && error.code !== "PGRST116")
                throw error;
            res.json(anonCart || { items: [] });
        }
        else {
            res.json({ cart_items: [] });
        }
    }
    catch (error) {
        console.error("[v0] Get cart error:", error);
        res.status(500).json({ error: "Failed to fetch cart" });
    }
});
// Add to cart
router.post("/", auth_1.optionalAuthMiddleware, anonCart_1.anonCartMiddleware, async (req, res) => {
    try {
        const { product_id, qty } = req.body;
        if (req.supabaseUser) {
            // Add to user cart
            let { data: cart } = await server_1.supabase.from("carts").select("id").eq("user_id", req.supabaseUser.id).single();
            if (!cart) {
                const { data: newCart } = await server_1.supabase
                    .from("carts")
                    .insert({ user_id: req.supabaseUser.id })
                    .select()
                    .single();
                cart = newCart;
            }
            const { data: product } = await server_1.supabase.from("products").select("price").eq("id", product_id).single();
            const { data, error } = await server_1.supabase
                .from("cart_items")
                .insert({
                cart_id: cart.id,
                product_id,
                qty,
                price: product.price,
            })
                .select()
                .single();
            if (error)
                throw error;
            res.status(201).json(data);
        }
        else {
            // Add to anonymous cart
            let cartId = req.anonCartId;
            if (!cartId) {
                cartId = (0, anonCart_1.createAnonCart)(res);
                await server_1.supabase.from("anonymous_carts").insert({
                    cookie_id: cartId,
                    items: [{ product_id, qty }],
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                });
            }
            else {
                const { data: anonCart } = await server_1.supabase
                    .from("anonymous_carts")
                    .select("items")
                    .eq("cookie_id", cartId)
                    .single();
                const items = anonCart?.items || [];
                items.push({ product_id, qty });
                await server_1.supabase
                    .from("anonymous_carts")
                    .update({ items, updated_at: new Date().toISOString() })
                    .eq("cookie_id", cartId);
            }
            res.status(201).json({ message: "Added to cart" });
        }
    }
    catch (error) {
        console.error("[v0] Add to cart error:", error);
        res.status(500).json({ error: "Failed to add to cart" });
    }
});
// Update cart item quantity
router.put("/item/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        const { qty } = req.body;
        const { data, error } = await server_1.supabase.from("cart_items").update({ qty }).eq("id", req.params.id).select().single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        console.error("[v0] Update cart item error:", error);
        res.status(500).json({ error: "Failed to update cart item" });
    }
});
// Remove cart item
router.delete("/item/:id", auth_1.authMiddleware, async (req, res) => {
    try {
        const { error } = await server_1.supabase.from("cart_items").delete().eq("id", req.params.id);
        if (error)
            throw error;
        res.json({ message: "Item removed from cart" });
    }
    catch (error) {
        console.error("[v0] Remove cart item error:", error);
        res.status(500).json({ error: "Failed to remove cart item" });
    }
});
// Clear cart
router.delete("/clear", auth_1.optionalAuthMiddleware, anonCart_1.anonCartMiddleware, async (req, res) => {
    try {
        if (req.supabaseUser) {
            const { data: cart } = await server_1.supabase.from("carts").select("id").eq("user_id", req.supabaseUser.id).single();
            if (cart) {
                await server_1.supabase.from("cart_items").delete().eq("cart_id", cart.id);
            }
        }
        else if (req.anonCartId) {
            await server_1.supabase.from("anonymous_carts").delete().eq("cookie_id", req.anonCartId);
            (0, anonCart_1.clearAnonCart)(res);
        }
        res.json({ message: "Cart cleared" });
    }
    catch (error) {
        console.error("[v0] Clear cart error:", error);
        res.status(500).json({ error: "Failed to clear cart" });
    }
});
exports.default = router;

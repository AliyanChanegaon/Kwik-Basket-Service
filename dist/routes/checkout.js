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
// Create order from cart
router.post("/", auth_1.optionalAuthMiddleware, anonCart_1.anonCartMiddleware, async (req, res) => {
    try {
        let cartItems = [];
        let totalAmount = 0;
        if (req.supabaseUser) {
            // Get user cart
            const { data: cart } = await server_1.supabase
                .from("carts")
                .select("*, cart_items(*, products(*))")
                .eq("user_id", req.supabaseUser.id)
                .single();
            cartItems = cart?.cart_items || [];
        }
        else if (req.anonCartId) {
            // Get anonymous cart
            const { data: anonCart } = await server_1.supabase
                .from("anonymous_carts")
                .select("items")
                .eq("cookie_id", req.anonCartId)
                .single();
            if (anonCart?.items) {
                const productIds = anonCart.items.map((item) => item.product_id);
                const { data: products } = await server_1.supabase.from("products").select("*").in("id", productIds);
                cartItems = anonCart.items.map((item) => {
                    const product = products?.find((p) => p.id === item.product_id);
                    return {
                        product_id: item.product_id,
                        qty: item.qty,
                        price: product?.price || 0,
                        products: product,
                    };
                });
            }
        }
        if (cartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }
        totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
        // Create order
        const { data: order, error: orderError } = await server_1.supabase
            .from("orders")
            .insert({
            user_id: req.supabaseUser?.id || null,
            total_amount: totalAmount,
            status: "pending",
            payment_status: "unpaid",
        })
            .select()
            .single();
        if (orderError)
            throw orderError;
        // Create order items
        const orderItems = cartItems.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            qty: item.qty,
            price: item.price,
        }));
        const { error: itemsError } = await server_1.supabase.from("order_items").insert(orderItems);
        if (itemsError)
            throw itemsError;
        res.status(201).json(order);
    }
    catch (error) {
        console.error("[v0] Checkout error:", error);
        res.status(500).json({ error: "Checkout failed" });
    }
});
exports.default = router;

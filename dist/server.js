"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET || "your-secret-key"));
// Supabase client
exports.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const products_1 = __importDefault(require("./routes/products"));
const categories_1 = __importDefault(require("./routes/categories"));
const cart_1 = __importDefault(require("./routes/cart"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const checkout_1 = __importDefault(require("./routes/checkout"));
const orders_1 = __importDefault(require("./routes/orders"));
const payments_1 = __importDefault(require("./routes/payments"));
const admin_1 = __importDefault(require("./routes/admin"));
app.use("/api/auth", auth_1.default);
app.use("/api/users", users_1.default);
app.use("/api/products", products_1.default);
app.use("/api/categories", categories_1.default);
app.use("/api/cart", cart_1.default);
app.use("/api/wishlist", wishlist_1.default);
app.use("/api/checkout", checkout_1.default);
app.use("/api/orders", orders_1.default);
app.use("/api/payments", payments_1.default);
app.use("/api/admin", admin_1.default);
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`[v0] Server running on port ${PORT}`);
});

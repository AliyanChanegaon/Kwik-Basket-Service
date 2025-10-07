import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())
app.use(cookieParser(process.env.COOKIE_SECRET || "your-secret-key"))

// Supabase client
export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

// Routes
import authRoutes from "./routes/auth"
import userRoutes from "./routes/users"
import productRoutes from "./routes/products"
import categoryRoutes from "./routes/categories"
import cartRoutes from "./routes/cart"
import wishlistRoutes from "./routes/wishlist"
import checkoutRoutes from "./routes/checkout"
import orderRoutes from "./routes/orders"
import paymentRoutes from "./routes/payment"
import adminRoutes from "./routes/admin"

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/wishlist", wishlistRoutes)
app.use("/api/checkout", checkoutRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/admin", adminRoutes)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`[v0] Server running on port ${PORT}`)
})

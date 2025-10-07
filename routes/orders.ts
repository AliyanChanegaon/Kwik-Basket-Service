import express from "express"
import { supabase } from "../server"
import { authMiddleware } from "../middleware/auth"

const router = express.Router()

// Get user orders
router.get("/", authMiddleware, async (req: any, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, products(*))")
      .eq("user_id", req.supabaseUser.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error("[v0] Get orders error:", error)
    res.status(500).json({ error: "Failed to fetch orders" })
  }
})

// Get single order
router.get("/:id", authMiddleware, async (req: any, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, products(*))")
      .eq("id", req.params.id)
      .eq("user_id", req.supabaseUser.id)
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error("[v0] Get order error:", error)
    res.status(404).json({ error: "Order not found" })
  }
})

// Cancel order
router.put("/:id/cancel", authMiddleware, async (req: any, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", req.params.id)
      .eq("user_id", req.supabaseUser.id)
      .eq("status", "pending")
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error("[v0] Cancel order error:", error)
    res.status(500).json({ error: "Failed to cancel order" })
  }
})

export default router

import express from "express"
import { supabase } from "../server"
import { authMiddleware } from "../middleware/auth"

const router = express.Router()

// Get all orders (Admin only)
router.get("/orders", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, products(*)), users(*)")
      .order("created_at", { ascending: false })

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error("[v0] Get admin orders error:", error)
    res.status(500).json({ error: "Failed to fetch orders" })
  }
})

// Update order status (Admin only)
router.put("/orders/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body

    const { data, error } = await supabase.from("orders").update({ status }).eq("id", req.params.id).select().single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error("[v0] Update order status error:", error)
    res.status(500).json({ error: "Failed to update order status" })
  }
})

export default router

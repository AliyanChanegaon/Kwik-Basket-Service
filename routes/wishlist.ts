import express from "express"
import { supabase } from "../server"
import { authMiddleware } from "../middleware/auth"

const router = express.Router()

// Get wishlist
router.get("/", authMiddleware, async (req: any, res) => {
  try {
    const { data, error } = await supabase.from("wishlist").select("*, products(*)").eq("user_id", req.supabaseUser.id)

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error("[v0] Get wishlist error:", error)
    res.status(500).json({ error: "Failed to fetch wishlist" })
  }
})

// Add to wishlist
router.post("/", authMiddleware, async (req: any, res) => {
  try {
    const { product_id } = req.body

    const { data, error } = await supabase
      .from("wishlist")
      .insert({
        user_id: req.supabaseUser.id,
        product_id,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    console.error("[v0] Add to wishlist error:", error)
    res.status(500).json({ error: "Failed to add to wishlist" })
  }
})

// Remove from wishlist
router.delete("/:id", authMiddleware, async (req: any, res) => {
  try {
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.supabaseUser.id)

    if (error) throw error

    res.json({ message: "Removed from wishlist" })
  } catch (error) {
    console.error("[v0] Remove from wishlist error:", error)
    res.status(500).json({ error: "Failed to remove from wishlist" })
  }
})

export default router

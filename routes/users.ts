import express from "express"
import { supabase } from "../server"
import { authMiddleware } from "../middleware/auth"

const router = express.Router()

// Get current user profile
router.get("/me", authMiddleware, async (req: any, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", req.supabaseUser.id).single()

    if (error) throw error

    res.json(data || req.supabaseUser)
  } catch (error) {
    console.error("[v0] Get user error:", error)
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

// Update user profile
router.put("/me", authMiddleware, async (req: any, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(req.body)
      .eq("id", req.supabaseUser.id)
      .select()
      .single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error("[v0] Update user error:", error)
    res.status(500).json({ error: "Failed to update user" })
  }
})

export default router

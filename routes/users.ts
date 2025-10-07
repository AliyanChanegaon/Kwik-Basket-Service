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

// Get addresses for current user
router.get("/addresses", authMiddleware, async (req: any, res) => {
  try {
    const { data, error } = await supabase.from("addresses").select("*").eq("user_id", req.supabaseUser.id).order("id")
    if (error) throw error
    res.json(data || [])
  } catch (error) {
    console.error("[v0] Get addresses error:", error)
    res.status(500).json({ error: "Failed to fetch addresses" })
  }
})

// Create a new address for current user
router.post("/addresses", authMiddleware, async (req: any, res) => {
  try {
    const payload = { ...req.body, user_id: req.supabaseUser.id }
    const { data, error } = await supabase.from("addresses").insert(payload).select().single()
    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error("[v0] Create address error:", error)
    res.status(500).json({ error: "Failed to create address" })
  }
})

// Update an existing address for current user
router.put("/addresses/:id", authMiddleware, async (req: any, res) => {
  try {
    const id = Number(req.params.id)
    const { data, error } = await supabase
      .from("addresses")
      .update(req.body)
      .eq("id", id)
      .eq("user_id", req.supabaseUser.id)
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error("[v0] Update address error:", error)
    res.status(500).json({ error: "Failed to update address" })
  }
})

// Delete an existing address for current user
router.delete("/addresses/:id", authMiddleware, async (req: any, res) => {
  try {
    const id = Number(req.params.id)
    const { error } = await supabase.from("addresses").delete().eq("id", id).eq("user_id", req.supabaseUser.id)
    if (error) throw error
    res.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete address error:", error)
    res.status(500).json({ error: "Failed to delete address" })
  }
})

export default router

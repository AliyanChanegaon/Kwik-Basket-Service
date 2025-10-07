import express from "express"
import { supabase } from "../server"
import { authMiddleware } from "../middleware/auth"

const router = express.Router()

// Get all categories
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error("[v0] Get categories error:", error)
    res.status(500).json({ error: "Failed to fetch categories" })
  }
})

// Create category (Admin only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from("categories").insert(req.body).select().single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    console.error("[v0] Create category error:", error)
    res.status(500).json({ error: "Failed to create category" })
  }
})

// Update category (Admin only)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from("categories").update(req.body).eq("id", req.params.id).select().single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error("[v0] Update category error:", error)
    res.status(500).json({ error: "Failed to update category" })
  }
})

// Delete category (Admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.from("categories").delete().eq("id", req.params.id)

    if (error) throw error

    res.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("[v0] Delete category error:", error)
    res.status(500).json({ error: "Failed to delete category" })
  }
})

export default router

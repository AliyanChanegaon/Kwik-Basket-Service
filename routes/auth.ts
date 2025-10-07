import express from "express"
import { supabase } from "../server"
import { authMiddleware } from "../middleware/auth"

const router = express.Router()

// Verify token
router.post("/verify", authMiddleware, async (req: any, res) => {
  try {
    res.json({ user: req.supabaseUser })
  } catch (error) {
    console.error("[v0] Verify error:", error)
    res.status(500).json({ error: "Verification failed" })
  }
})

// Logout
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (token) {
      await supabase.auth.signOut()
    }

    res.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("[v0] Logout error:", error)
    res.status(500).json({ error: "Logout failed" })
  }
})

export default router

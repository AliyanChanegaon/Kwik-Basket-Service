import type { Request, Response, NextFunction } from "express"
import { supabase } from "../server"

export interface AuthRequest extends Request {
  supabaseUser?: any
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" })
    }

    req.supabaseUser = user
    next()
  } catch (error) {
    console.error("[v0] Auth middleware error:", error)
    res.status(500).json({ error: "Authentication failed" })
  }
}

export const optionalAuthMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (token) {
      const {
        data: { user },
      } = await supabase.auth.getUser(token)
      if (user) {
        req.supabaseUser = user
      }
    }

    next()
  } catch (error) {
    console.error("[v0] Optional auth middleware error:", error)
    next()
  }
}

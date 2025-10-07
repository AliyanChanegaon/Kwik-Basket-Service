import type { Request, Response, NextFunction } from "express"
import { v4 as uuidv4 } from "uuid"

export interface AnonCartRequest extends Request {
  anonCartId?: string
}

export const anonCartMiddleware = (req: AnonCartRequest, res: Response, next: NextFunction) => {
  try {
    const cookieId = req.signedCookies.kb_anon_cart

    if (cookieId) {
      req.anonCartId = cookieId
    }

    next()
  } catch (error) {
    console.error("[v0] Anon cart middleware error:", error)
    next()
  }
}

export const createAnonCart = (res: Response): string => {
  const cartId = uuidv4()

  res.cookie("kb_anon_cart", cartId, {
    signed: true,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  })

  return cartId
}

export const clearAnonCart = (res: Response) => {
  res.clearCookie("kb_anon_cart")
}

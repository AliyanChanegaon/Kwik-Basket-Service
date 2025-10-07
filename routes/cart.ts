import express from "express"
import { supabase } from "../server"
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth"
import { anonCartMiddleware, createAnonCart, clearAnonCart } from "../middleware/anonCart"

const router = express.Router()

// Get cart
router.get("/", optionalAuthMiddleware, anonCartMiddleware, async (req: any, res) => {
  try {
    if (req.supabaseUser) {
      // Get user cart
      const { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("*, cart_items(*, products(*))")
        .eq("user_id", req.supabaseUser.id)
        .single()

      if (cartError && cartError.code !== "PGRST116") throw cartError

      res.json(cart || { cart_items: [] })
    } else if (req.anonCartId) {
      // Get anonymous cart
      const { data: anonCart, error } = await supabase
        .from("anonymous_carts")
        .select("*")
        .eq("cookie_id", req.anonCartId)
        .single()

      if (error && error.code !== "PGRST116") throw error

      res.json(anonCart || { items: [] })
    } else {
      res.json({ cart_items: [] })
    }
  } catch (error) {
    console.error("[v0] Get cart error:", error)
    res.status(500).json({ error: "Failed to fetch cart" })
  }
})

// Add to cart
router.post("/", optionalAuthMiddleware, anonCartMiddleware, async (req: any, res) => {
  try {
    const { product_id, qty } = req.body

    if (req.supabaseUser) {
      // Add to user cart
      let { data: cart } = await supabase.from("carts").select("id").eq("user_id", req.supabaseUser.id).single()

      if (!cart) {
        const { data: newCart } = await supabase
          .from("carts")
          .insert({ user_id: req.supabaseUser.id })
          .select()
          .single()
        cart = newCart
      }

      const { data: product } = await supabase.from("products").select("price").eq("id", product_id).single()

      const { data, error } = await supabase
        .from("cart_items")
        .insert({
          cart_id: cart!.id,
          product_id,
          qty,
          price: product!.price,
        })
        .select()
        .single()

      if (error) throw error

      res.status(201).json(data)
    } else {
      // Add to anonymous cart
      let cartId = req.anonCartId

      if (!cartId) {
        cartId = createAnonCart(res)

        await supabase.from("anonymous_carts").insert({
          cookie_id: cartId,
          items: [{ product_id, qty }],
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
      } else {
        const { data: anonCart } = await supabase
          .from("anonymous_carts")
          .select("items")
          .eq("cookie_id", cartId)
          .single()

        const items = anonCart?.items || []
        items.push({ product_id, qty })

        await supabase
          .from("anonymous_carts")
          .update({ items, updated_at: new Date().toISOString() })
          .eq("cookie_id", cartId)
      }

      res.status(201).json({ message: "Added to cart" })
    }
  } catch (error) {
    console.error("[v0] Add to cart error:", error)
    res.status(500).json({ error: "Failed to add to cart" })
  }
})

// Update cart item quantity
router.put("/item/:id", authMiddleware, async (req: any, res) => {
  try {
    const { qty } = req.body

    const { data, error } = await supabase.from("cart_items").update({ qty }).eq("id", req.params.id).select().single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error("[v0] Update cart item error:", error)
    res.status(500).json({ error: "Failed to update cart item" })
  }
})

// Remove cart item
router.delete("/item/:id", authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.from("cart_items").delete().eq("id", req.params.id)

    if (error) throw error

    res.json({ message: "Item removed from cart" })
  } catch (error) {
    console.error("[v0] Remove cart item error:", error)
    res.status(500).json({ error: "Failed to remove cart item" })
  }
})

// Clear cart
router.delete("/clear", optionalAuthMiddleware, anonCartMiddleware, async (req: any, res) => {
  try {
    if (req.supabaseUser) {
      const { data: cart } = await supabase.from("carts").select("id").eq("user_id", req.supabaseUser.id).single()

      if (cart) {
        await supabase.from("cart_items").delete().eq("cart_id", cart.id)
      }
    } else if (req.anonCartId) {
      await supabase.from("anonymous_carts").delete().eq("cookie_id", req.anonCartId)

      clearAnonCart(res)
    }

    res.json({ message: "Cart cleared" })
  } catch (error) {
    console.error("[v0] Clear cart error:", error)
    res.status(500).json({ error: "Failed to clear cart" })
  }
})

export default router

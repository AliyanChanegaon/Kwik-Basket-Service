import express from "express"
import { supabase } from "../server"
import { optionalAuthMiddleware } from "../middleware/auth"
import { anonCartMiddleware } from "../middleware/anonCart"

const router = express.Router()

// Create order from cart
router.post("/", optionalAuthMiddleware, anonCartMiddleware, async (req: any, res) => {
  try {
    let cartItems: any[] = []
    let totalAmount = 0

    if (req.supabaseUser) {
      // Get user cart
      const { data: cart } = await supabase
        .from("carts")
        .select("*, cart_items(*, products(*))")
        .eq("user_id", req.supabaseUser.id)
        .single()

      cartItems = cart?.cart_items || []
    } else if (req.anonCartId) {
      // Get anonymous cart
      const { data: anonCart } = await supabase
        .from("anonymous_carts")
        .select("items")
        .eq("cookie_id", req.anonCartId)
        .single()

      if (anonCart?.items) {
        const productIds = anonCart.items.map((item: any) => item.product_id)
        const { data: products } = await supabase.from("products").select("*").in("id", productIds)

        cartItems = anonCart.items.map((item: any) => {
          const product = products?.find((p) => p.id === item.product_id)
          return {
            product_id: item.product_id,
            qty: item.qty,
            price: product?.price || 0,
            products: product,
          }
        })
      }
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" })
    }

    totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: req.supabaseUser?.id || null,
        total_amount: totalAmount,
        status: "pending",
        payment_status: "unpaid",
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      qty: item.qty,
      price: item.price,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) throw itemsError

    res.status(201).json(order)
  } catch (error) {
    console.error("[v0] Checkout error:", error)
    res.status(500).json({ error: "Checkout failed" })
  }
})

export default router

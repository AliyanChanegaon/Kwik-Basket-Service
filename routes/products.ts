import express from "express"
import { supabase } from "../server"
import { authMiddleware } from "../middleware/auth"

const router = express.Router()

// Get all products with filters
router.get("/", async (req, res) => {
  try {
    const { category, min_price, max_price, sort } = req.query

    let query = supabase.from("products").select("*")

    if (category) {
      query = query.eq("category_id", category)
    }

    if (min_price) {
      query = query.gte("price", Number(min_price))
    }

    if (max_price) {
      query = query.lte("price", Number(max_price))
    }

    if (sort === "price_asc") {
      query = query.order("price", { ascending: true })
    } else if (sort === "price_desc") {
      query = query.order("price", { ascending: false })
    } else if(sort === "rating_desc") {
      query = query.order("ratings", { ascending: false })
    }
     else if (sort === "newest") {
      query = query.order("created_at", { ascending: true })
    } else if(sort === "id"){
      query = query.order("id", { ascending: true })
    }
    else {
      query = query.order("created_at", { ascending: false })
    }


    const { data, error } = await query

    if (error) throw error

    const formattedData = data.map((product: any) => ({
  ...product,
  price: Number(product.price).toFixed(2),
}))

     res.json(formattedData)
  } catch (error) {
    console.error("[v0] Get products error:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*").eq("id", req.params.id).single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error("[v0] Get product error:", error)
    res.status(404).json({ error: "Product not found" })
  }
})

// Create product (Admin only)
router.post("/", authMiddleware, async (req: any, res) => {
  try {
    const { data, error } = await supabase.from("products").insert(req.body).select().single()

    if (error) throw error

    res.status(201).json(data)
  } catch (error) {
    console.error("[v0] Create product error:", error)
    res.status(500).json({ error: "Failed to create product" })
  }
})

// Update product (Admin only)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").update(req.body).eq("id", req.params.id).select().single()

    if (error) throw error

    res.json(data)
  } catch (error) {
    console.error("[v0] Update product error:", error)
    res.status(500).json({ error: "Failed to update product" })
  }
})

// Delete product (Admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { error } = await supabase.from("products").delete().eq("id", req.params.id)

    if (error) throw error

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("[v0] Delete product error:", error)
    res.status(500).json({ error: "Failed to delete product" })
  }
})

export default router

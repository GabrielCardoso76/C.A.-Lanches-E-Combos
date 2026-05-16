"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { menuData } from "@/lib/menu-data"
import type { MenuItem } from "@/components/cart-context"

export function useProducts() {
  const [products, setProducts] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      if (!supabase) {
        console.warn("Supabase credentials missing. Falling back to local mock data.")
        setProducts(menuData)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase.from("products").select("*").order("category", { ascending: true })

        if (error) {
          console.error("Error fetching products:", error)
          setProducts(menuData)
        } else if (data && data.length > 0) {
          // Map DB columns to our MenuItem interface if needed.
          // Assuming DB columns: id, name, description, price, image, images, category, featured, best_seller
          setProducts(data as MenuItem[])
        } else {
          // If no data yet, fallback to mock data so UI doesn't look empty
          setProducts(menuData)
        }
      } catch (err) {
        console.error("Unexpected error fetching products:", err)
        setProducts(menuData)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return { products, loading }
}

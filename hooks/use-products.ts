"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { menuData } from "@/lib/menu-data"
import type { MenuItem } from "@/components/cart-context"

export function useProducts() {
  const [products, setProducts] = useState<MenuItem[]>([])
  const [storeOpen, setStoreOpen] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        console.warn("Supabase credentials missing. Falling back to local mock data.")
        setProducts(menuData)
        setLoading(false)
        return
      }

      try {
        // Fetch products
        const { data: prodData, error: prodError } = await supabase.from("products").select("*").order("category", { ascending: true })

        if (prodError) {
          console.error("Error fetching products:", prodError)
          setProducts(menuData)
        } else if (prodData && prodData.length > 0) {
          setProducts(prodData as MenuItem[])
        } else {
          setProducts(menuData)
        }

        // Fetch settings
        const { data: settingsData } = await supabase.from("settings").select("is_open").eq("id", 1).single()
        if (settingsData) {
          setStoreOpen(settingsData.is_open)
        }

      } catch (err) {
        console.error("Unexpected error fetching data:", err)
        setProducts(menuData)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { products, storeOpen, loading }
}

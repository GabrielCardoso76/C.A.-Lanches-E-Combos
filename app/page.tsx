"use client"

import { useState, useEffect } from "react"
import { CartProvider } from "@/components/cart-context"
import { HeroBanner } from "@/components/hero-banner"
import { CategoryTabs } from "@/components/category-tabs"
import { MenuSection } from "@/components/menu-section"
import { BottomBar } from "@/components/bottom-bar"
import { CartDrawer } from "@/components/cart-drawer"
import { categories } from "@/lib/menu-data"

function MenuContent() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id)
  const [cartOpen, setCartOpen] = useState(false)

  function handleSelectCategory(id: string) {
    setActiveCategory(id)
    const section = document.getElementById(`section-${id}`)
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Track scroll to highlight active category
  useEffect(() => {
    function handleScroll() {
      const sections = categories.map((cat) => ({
        id: cat.id,
        el: document.getElementById(`section-${cat.id}`),
      }))

      let current = categories[0].id
      for (const s of sections) {
        if (s.el) {
          const rect = s.el.getBoundingClientRect()
          if (rect.top <= 120) {
            current = s.id
          }
        }
      }
      setActiveCategory(current)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen pb-20">
      <HeroBanner />
      <CategoryTabs activeCategory={activeCategory} onSelect={handleSelectCategory} />

      <main className="mx-auto max-w-lg flex flex-col gap-6 py-4">
        {categories.map((cat) => (
          <MenuSection key={cat.id} categoryId={cat.id} />
        ))}
      </main>

      <BottomBar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}

export default function MenuPage() {
  return (
    <CartProvider>
      <MenuContent />
    </CartProvider>
  )
}

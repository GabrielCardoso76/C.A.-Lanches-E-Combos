"use client"

import { useState, useEffect } from "react"
import { CartProvider } from "@/components/cart-context"
import { HeroBanner } from "@/components/hero-banner"
import { CategoryTabs } from "@/components/category-tabs"
import { MenuSection } from "@/components/menu-section"
import { BottomBar } from "@/components/bottom-bar"
import { CartDrawer } from "@/components/cart-drawer"
import { categories } from "@/lib/menu-data"
import { useProducts } from "@/hooks/use-products"
import { MenuItemCard } from "@/components/menu-item-card"
import { ProductModal } from "@/components/product-modal"
import type { MenuItem } from "@/components/cart-context"

function MenuContent() {
  const [activeCategory, setActiveCategory] = useState(categories[0].id)
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null)
  const { products, storeOpen, loading } = useProducts()

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

  const featuredProducts = products.filter(p => p.featured)

  return (
    <div className="min-h-screen pb-20">
      <HeroBanner isOpen={storeOpen} />
      <CategoryTabs activeCategory={activeCategory} onSelect={handleSelectCategory} />

      <main className="mx-auto max-w-4xl flex flex-col gap-8 py-6 px-4">
        {featuredProducts.length > 0 && (
          <section id="section-destaques" className="scroll-mt-32">
            <h2 className="mb-4 text-2xl font-black text-foreground border-b pb-2">Destaques</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredProducts.map(item => (
                <MenuItemCard key={item.id} item={item} onClick={setSelectedProduct} />
              ))}
            </div>
          </section>
        )}

        {categories.map((cat) => {
          const catProducts = products.filter(p => p.category === cat.id)
          if (catProducts.length === 0) return null

          return (
            <section key={cat.id} id={`section-${cat.id}`} className="scroll-mt-32">
              <h2 className="mb-4 text-2xl font-black text-foreground border-b pb-2">
                {cat.label} {cat.emoji}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catProducts.map((item) => (
                  <MenuItemCard key={item.id} item={item} onClick={setSelectedProduct} />
                ))}
              </div>
            </section>
          )
        })}
      </main>

      <BottomBar onOpenCart={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      {!!selectedProduct && (
        <ProductModal
          item={selectedProduct}
          isOpen={true}
          onClose={() => setSelectedProduct(null)}
        />
      )}
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

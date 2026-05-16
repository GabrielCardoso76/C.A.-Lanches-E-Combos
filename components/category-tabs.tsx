"use client"

import { useRef, useEffect } from "react"
import { categories } from "@/lib/menu-data"

interface CategoryTabsProps {
  activeCategory: string
  onSelect: (id: string) => void
}

export function CategoryTabs({ activeCategory, onSelect }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current) return
    const active = scrollRef.current.querySelector(`[data-category="${activeCategory}"]`)
    if (active) {
      active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
    }
  }, [activeCategory])

  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-card shadow-sm">
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto px-3 py-2 scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            data-category={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <span className="text-base">{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

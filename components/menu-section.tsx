"use client"

import { menuData, categories } from "@/lib/menu-data"
import { MenuItemCard } from "@/components/menu-item-card"

interface MenuSectionProps {
  categoryId: string
}

export function MenuSection({ categoryId }: MenuSectionProps) {
  const category = categories.find((c) => c.id === categoryId)
  const items = menuData.filter((item) => item.category === categoryId)

  if (!category || items.length === 0) return null

  return (
    <section id={`section-${categoryId}`} className="scroll-mt-14">
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="text-xl">{category.emoji}</span>
        <h2 className="text-lg font-bold text-foreground">{category.label}</h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex flex-col gap-3 px-4">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}

"use client"

import Image from "next/image"
import { Plus, Minus } from "lucide-react"
import { useCart, type MenuItem } from "@/components/cart-context"

interface MenuItemCardProps {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { items, addItem, updateQuantity } = useCart()
  const cartItem = items.find((i) => i.id === item.id)
  const quantity = cartItem?.quantity ?? 0

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-card-foreground leading-tight">{item.name}</h3>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-base font-black text-primary">
            R$ {item.price.toFixed(2).replace(".", ",")}
          </span>
          {quantity === 0 ? (
            <button
              onClick={() => addItem(item)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform active:scale-90"
              aria-label={`Adicionar ${item.name}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, quantity - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-primary text-primary transition-transform active:scale-90"
                aria-label={`Remover ${item.name}`}
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-5 text-center text-sm font-bold text-card-foreground">{quantity}</span>
              <button
                onClick={() => addItem(item)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-90"
                aria-label={`Adicionar mais ${item.name}`}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

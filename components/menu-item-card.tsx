"use client"

import Image from "next/image"
import { Plus, Minus } from "lucide-react"
import { useCart, type MenuItem } from "@/components/cart-context"

interface MenuItemCardProps {
  item: MenuItem
}

interface MenuItemCardProps {
  item: MenuItem
  onClick?: (item: MenuItem) => void
}

export function MenuItemCard({ item, onClick }: MenuItemCardProps) {
  const { items, addItem, updateQuantity } = useCart()
  const cartItem = items.find((i) => i.id === item.id)
  const quantity = cartItem?.quantity ?? 0

  const imageUrl = item.images && item.images.length > 0 ? item.images[0] : item.image
  const isAvailable = item.available !== false

  const handleCardClick = () => {
    if (onClick) onClick(item)
  }

  return (
    <div
      className={`flex gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md relative cursor-pointer ${
        !isAvailable ? "opacity-75" : ""
      }`}
      onClick={handleCardClick}
    >
      <div className="relative h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-lg bg-muted">
        {!isAvailable && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-[2px]">
            <span className="bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-black px-2 py-1 rounded shadow-sm rotate-[-12deg]">
              ESGOTADO
            </span>
          </div>
        )}
        {item.best_seller && (
          <div className="absolute top-0 left-0 z-10 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm">
            Mais Vendido
          </div>
        )}
        <Image
          src={imageUrl}
          alt={item.name}
          fill
          className={`object-cover ${!isAvailable ? 'grayscale' : ''}`}
          sizes="(max-width: 640px) 96px, 128px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-card-foreground leading-tight">{item.name}</h3>
          <p className="mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base sm:text-lg font-black text-primary">
            R$ {item.price.toFixed(2).replace(".", ",")}
          </span>
          {isAvailable && (
            <div onClick={(e) => e.stopPropagation()}>
              {quantity === 0 ? (
                <button
                  onClick={() => addItem(item)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95"
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
          )}
        </div>
      </div>
    </div>
  )
}

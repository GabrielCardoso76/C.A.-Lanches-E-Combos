"use client"

import { useState } from "react"
import Image from "next/image"
import { X, Plus, Minus, ShoppingBag } from "lucide-react"
import { useCart, type MenuItem } from "@/components/cart-context"

interface ProductModalProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
}

export function ProductModal({ item, isOpen, onClose }: ProductModalProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)

  // Safe default values for hooks before early return
  const images = item?.images && item.images.length > 0 ? item.images : (item ? [item.image] : [""])
  const [currentImage, setCurrentImage] = useState(images[0])

  if (!isOpen || !item) return null

  const isAvailable = item.available !== false

  const handleAddToCart = () => {
    if (!isAvailable) return
    // Add multiple times to match quantity
    for (let i = 0; i < quantity; i++) {
      addItem(item)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm sm:p-6">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-card rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-background/50 backdrop-blur-md text-foreground rounded-full hover:bg-background/80 transition-colors"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <div className="overflow-y-auto flex-1">
          {/* Main Image */}
          <div className="relative w-full aspect-square sm:aspect-[4/3] bg-muted">
            <Image
              src={currentImage}
              alt={item.name}
              fill
              className={`object-cover ${!isAvailable ? 'grayscale opacity-70' : ''}`}
              sizes="(max-width: 768px) 100vw, 500px"
            />
            {!isAvailable && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-black text-xl rotate-[-10deg] shadow-lg">
                  ESGOTADO
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails if > 1 */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(img)}
                  className={`relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                    currentImage === img ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Imagem ${idx + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}

          <div className="p-5 sm:p-6">
            <div className="flex justify-between items-start gap-4 mb-2">
              <h2 className="text-2xl font-black text-foreground">{item.name}</h2>
              <span className="text-xl font-bold text-primary shrink-0">
                R$ {item.price.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded font-bold capitalize">
                {item.category}
              </span>
              {item.featured && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">Destaque</span>
              )}
              {item.best_seller && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-bold">Mais Vendido</span>
              )}
            </div>

            {item.description && (
              <p className="text-muted-foreground leading-relaxed mb-6">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-border bg-card mt-auto">
          {isAvailable ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-muted rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background transition-colors text-foreground"
                  disabled={quantity <= 1}
                >
                  <Minus size={18} />
                </button>
                <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background transition-colors text-foreground"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-primary-foreground h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm active:scale-95"
              >
                <ShoppingBag size={20} />
                <span>Adicionar • R$ {(item.price * quantity).toFixed(2).replace(".", ",")}</span>
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full bg-muted text-muted-foreground h-12 rounded-xl font-bold flex items-center justify-center cursor-not-allowed"
            >
              Indisponível no momento
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

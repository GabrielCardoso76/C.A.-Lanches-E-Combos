"use client"

import { useState } from "react"
import { X, Plus, Minus, Trash2, MessageCircle } from "lucide-react"
import { useCart } from "@/components/cart-context"
import { CheckoutModal } from "@/components/checkout-modal"

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  storeOpen?: boolean
}

export function CartDrawer({ isOpen, onClose, storeOpen = true }: CartDrawerProps) {
  const { items, updateQuantity, updateObservations, removeItem, clearCart, totalPrice } = useCart()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  return (
    <>
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl bg-card shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-bold text-card-foreground">Seu Pedido</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent"
            aria-label="Fechar carrinho"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <MessageCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-card-foreground">Seu carrinho está vazio</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Adicione itens do cardápio para fazer seu pedido
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-card-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        R$ {item.price.toFixed(2).replace(".", ",")} un.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-primary text-primary transition-transform active:scale-90"
                        aria-label={`Diminuir ${item.name}`}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold text-card-foreground">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-90"
                        aria-label={`Aumentar ${item.name}`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-bold text-primary">
                        R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-destructive transition-colors hover:text-destructive/80"
                        aria-label={`Remover ${item.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Observations Field */}
                  <div className="mt-1">
                    <input
                      type="text"
                      placeholder="Alguma observação? (ex: sem cebola)"
                      value={item.observations || ""}
                      onChange={(e) => updateObservations(item.id, e.target.value)}
                      className="w-full text-xs rounded-md border border-input bg-muted/50 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-colors placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
              ))}

              {/* Clear cart */}
              <button
                onClick={clearCart}
                className="mt-1 text-xs font-medium text-destructive underline underline-offset-2"
              >
                Limpar carrinho
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-4 pb-6 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Total</span>
              <span className="text-xl font-black text-primary">
                R$ {totalPrice.toFixed(2).replace(".", ",")}
              </span>
            </div>
            {storeOpen ? (
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.98]"
              >
                Finalizar Pedido
              </button>
            ) : (
              <button
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-muted text-muted-foreground py-3.5 text-sm font-bold shadow-none cursor-not-allowed"
              >
                Loja Fechada no momento
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}

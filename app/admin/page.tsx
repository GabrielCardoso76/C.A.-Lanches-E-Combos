"use client"

import { useState } from "react"
import { useProducts } from "@/hooks/use-products"
import { ProductForm } from "@/components/admin/product-form"
import type { MenuItem } from "@/components/cart-context"
import { Plus, Pencil, LogOut, Check } from "lucide-react"
import Image from "next/image"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const { products, loading } = useProducts()
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    Cookies.remove("admin_auth")
    router.push("/admin/login")
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border px-4 py-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-black text-foreground">Administração</h1>
        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          aria-label="Sair"
        >
          <LogOut size={20} />
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {isAdding || editingProduct ? (
          <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <h2 className="text-lg font-bold mb-4">
              {isAdding ? "Novo Produto" : "Editar Produto"}
            </h2>
            <ProductForm
              initialData={editingProduct}
              onCancel={() => {
                setIsAdding(false)
                setEditingProduct(null)
              }}
              onSaved={() => {
                setIsAdding(false)
                setEditingProduct(null)
                // in a real app, you'd refetch products here
                window.location.reload()
              }}
            />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Produtos</h2>
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Adicionar</span>
              </button>
            </div>

            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={product.images && product.images.length > 0 ? product.images[0] : product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground truncate">{product.name}</h3>
                      {product.featured && (
                        <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold">Destaque</span>
                      )}
                      {product.best_seller && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">Mais Vendido</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{product.category}</p>
                    <p className="font-bold text-primary mt-1">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="p-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors shrink-0"
                    aria-label="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

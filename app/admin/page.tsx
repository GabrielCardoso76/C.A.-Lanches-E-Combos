"use client"

import { useState } from "react"
import { useProducts } from "@/hooks/use-products"
import { ProductForm } from "@/components/admin/product-form"
import type { MenuItem } from "@/components/cart-context"
import { Plus, Pencil, Trash2, Filter, X } from "lucide-react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { categories } from "@/lib/menu-data"

export default function AdminPage() {
  const { products, loading } = useProducts()
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState<MenuItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Filters state
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterFeatured, setFilterFeatured] = useState<boolean>(false)
  const [filterBestSeller, setFilterBestSeller] = useState<boolean>(false)
  const [showFilters, setShowFilters] = useState(false)

  const handleDelete = async () => {
    if (!deletingProduct || !supabase) return
    setIsDeleting(true)
    try {
      await supabase.from("products").delete().eq("id", deletingProduct.id)
      window.location.reload()
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Erro ao excluir o produto.")
    } finally {
      setIsDeleting(false)
      setDeletingProduct(null)
    }
  }

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center">Carregando produtos...</div>
  }

  // Apply filters
  const filteredProducts = products.filter(product => {
    if (filterCategory !== "all" && product.category !== filterCategory) return false
    if (filterFeatured && !product.featured) return false
    if (filterBestSeller && !product.best_seller) return false
    return true
  })

  return (
    <div className="pb-20">
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">Produtos</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-colors shadow-sm border ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'bg-card text-foreground border-border hover:bg-muted'}`}
                >
                  <Filter size={18} />
                  <span className="hidden sm:inline">Filtrar</span>
                </button>
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Adicionar</span>
                </button>
              </div>
            </div>

            {/* Filters UI */}
            {showFilters && (
              <div className="bg-card border border-border p-4 rounded-xl mb-6 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                <div className="w-full sm:flex-1">
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Categoria</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full border border-input rounded-lg p-2 bg-background focus:ring-2 focus:ring-primary outline-none text-sm"
                  >
                    <option value="all">Todas as categorias</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterFeatured}
                      onChange={(e) => setFilterFeatured(e.target.checked)}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="text-sm font-bold">Destaques</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterBestSeller}
                      onChange={(e) => setFilterBestSeller(e.target.checked)}
                      className="w-4 h-4 text-primary accent-primary"
                    />
                    <span className="text-sm font-bold">Mais Vendidos</span>
                  </label>
                </div>
                {(filterCategory !== "all" || filterFeatured || filterBestSeller) && (
                  <button
                    onClick={() => {
                      setFilterCategory("all")
                      setFilterFeatured(false)
                      setFilterBestSeller(false)
                    }}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 mt-2 sm:mt-0"
                  >
                    <X size={14} /> Limpar
                  </button>
                )}
              </div>
            )}

            <div className="space-y-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-10 bg-card border border-border rounded-xl">
                  <p className="text-muted-foreground">Nenhum produto encontrado com esses filtros.</p>
                </div>
              ) : null}
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-card border border-border rounded-xl p-3 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div
                    className="relative h-16 w-16 rounded-lg overflow-hidden shrink-0 cursor-pointer border border-border hover:opacity-80 transition-opacity"
                    onClick={() => setPreviewImage(product.images && product.images.length > 0 ? product.images[0] : product.image)}
                  >
                    <Image
                      src={product.images && product.images.length > 0 ? product.images[0] : product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-foreground truncate">{product.name}</h3>
                      {product.available === false && (
                        <span className="bg-destructive/10 text-destructive text-[10px] px-1.5 py-0.5 rounded font-bold">Esgotado</span>
                      )}
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
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                      aria-label="Editar"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => setDeletingProduct(product)}
                      className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"
                      aria-label="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative w-full max-w-2xl aspect-square rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <Image
              src={previewImage}
              alt="Visualização do produto"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 800px"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-background/50 backdrop-blur-md text-foreground rounded-full hover:bg-background/80 transition-colors"
              aria-label="Fechar"
            >
              <Trash2 className="hidden" /> {/* just to import icon correctly below without changing imports */}
              <span className="font-bold text-xl px-2 leading-none">&times;</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 rounded-2xl shadow-xl max-w-sm w-full">
            <h3 className="text-xl font-bold text-foreground mb-2">Excluir Produto</h3>
            <p className="text-muted-foreground mb-6">
              Tem certeza que deseja excluir o produto <strong>{deletingProduct.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingProduct(null)}
                disabled={isDeleting}
                className="flex-1 py-2 px-4 border border-border rounded-lg font-bold hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2 px-4 bg-destructive text-destructive-foreground rounded-lg font-bold hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

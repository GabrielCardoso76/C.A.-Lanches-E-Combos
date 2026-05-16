"use client"

import { useState } from "react"
import type { MenuItem } from "@/components/cart-context"
import { categories } from "@/lib/menu-data"
import { supabase } from "@/lib/supabase"
import { X } from "lucide-react"

interface ProductFormProps {
  initialData?: MenuItem | null
  onCancel: () => void
  onSaved: () => void
}

export function ProductForm({ initialData, onCancel, onSaved }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    category: initialData?.category || categories[0].id,
    images: initialData?.images?.length ? [...initialData.images] : (initialData?.image ? [initialData.image] : [""]),
    featured: initialData?.featured || false,
    best_seller: initialData?.best_seller || false,
    available: initialData?.available !== false, // defaults to true unless explicitly false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const addImageField = () => {
    if (formData.images.length < 4) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ""] }))
    }
  }

  const removeImageField = (index: number) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, images: newImages }))
    } else {
      handleImageChange(0, "") // just clear it if it's the last one
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // filter empty image urls
    const cleanImages = formData.images.filter(img => img.trim() !== "")

    // Validate
    if (!formData.name || !formData.price || cleanImages.length === 0) {
      setError("Nome, preço e pelo menos uma imagem são obrigatórios.")
      setLoading(false)
      return
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price.replace(',', '.')),
      category: formData.category,
      images: cleanImages,
      image: cleanImages[0], // fallback for old field
      featured: formData.featured,
      best_seller: formData.best_seller,
      available: formData.available,
    }

    try {
      if (supabase) {
        if (initialData?.id) {
          // Update
          const { error: sbError } = await supabase
            .from("products")
            .update(productData)
            .eq("id", initialData.id)

          if (sbError) throw sbError
        } else {
          // Insert
          const { error: sbError } = await supabase
            .from("products")
            .insert([productData])

          if (sbError) throw sbError
        }
        onSaved()
      } else {
        // Mock success if no supabase configured
        console.log("Mock save:", productData)
        alert("Configuração do banco de dados não encontrada. Simulando sucesso no console.")
        onSaved()
      }
    } catch (err: any) {
      console.error("Save error:", err)
      setError(err.message || "Erro ao salvar o produto.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1">Nome *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-2 bg-background focus:ring-2 focus:ring-primary outline-none"
            placeholder="Ex: X-Burger"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Preço (R$) *</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-2 bg-background focus:ring-2 focus:ring-primary outline-none"
            placeholder="18.00 ou 18,00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Categoria *</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border rounded-lg p-2 bg-background focus:ring-2 focus:ring-primary outline-none"
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1">Descrição</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full border rounded-lg p-2 bg-background focus:ring-2 focus:ring-primary outline-none resize-none"
          placeholder="Ingredientes e detalhes..."
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-bold">Imagens (Links) *</label>
        <p className="text-xs text-muted-foreground">Adicione links para as imagens. A primeira será a principal. (Máx: 4)</p>

        {formData.images.map((img, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="url"
              value={img}
              onChange={(e) => handleImageChange(index, e.target.value)}
              className="flex-1 border rounded-lg p-2 bg-background focus:ring-2 focus:ring-primary outline-none text-sm"
              placeholder="https://exemplo.com/imagem.jpg"
              required={index === 0}
            />
            <button
              type="button"
              onClick={() => removeImageField(index)}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
              aria-label="Remover imagem"
            >
              <X size={18} />
            </button>
          </div>
        ))}

        {formData.images.length < 4 && (
          <button
            type="button"
            onClick={addImageField}
            className="text-sm font-bold text-primary hover:underline"
          >
            + Adicionar mais uma imagem
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-6 py-4 border-y border-border mt-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleChange}
            className="w-4 h-4 text-primary accent-primary"
          />
          <span className="text-sm font-bold text-foreground">Disponível</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="w-4 h-4 text-primary accent-primary"
          />
          <span className="text-sm font-bold text-foreground">Destaque</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="best_seller"
            checked={formData.best_seller}
            onChange={handleChange}
            className="w-4 h-4 text-primary accent-primary"
          />
          <span className="text-sm font-bold text-foreground">Mais Vendido</span>
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-2 px-4 border border-border rounded-lg font-bold hover:bg-muted transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? "Salvando..." : "Salvar Produto"}
        </button>
      </div>
    </form>
  )
}

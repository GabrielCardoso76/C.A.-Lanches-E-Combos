"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Clock, MapPin, DollarSign, CheckCircle2, ChefHat, AlertCircle, BellRing, Edit2, Trash2, X } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

// Defines the structure matching our JSONB storage
interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  observations?: string
}

interface DeliveryAddress {
  street: string
  number: string
  neighborhood: string
  complement?: string
  reference?: string
}

interface Order {
  id: string
  order_number: number | null
  items: OrderItem[]
  total: number
  payment_method: string
  change_for: number | null
  delivery_fee: number
  delivery_address: DeliveryAddress | null
  status: "pendente" | "preparando" | "concluido" | "cancelado"
  created_at: string
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  // Web Audio API context ref
  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== "undefined" && !audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContext) {
        audioContextRef.current = new AudioContext()
      }
    }
  }, [])

  const fetchOrders = async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .not("status", "in", '("concluido","cancelado")')
      .order("created_at", { ascending: true })

    if (data && !error) {
      setOrders(data as Order[])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()

    if (!supabase) return

    // Set up Supabase Realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
             const newOrder = payload.new as Order
             if (newOrder.status !== "concluido" && newOrder.status !== "cancelado") {
               setOrders(prev => [...prev, newOrder].sort((a, b) =>
                 new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
               ))
               playAlert()
             }
          } else if (payload.eventType === 'UPDATE') {
             const updatedOrder = payload.new as Order
             setOrders(prev => {
                if (updatedOrder.status === "concluido" || updatedOrder.status === "cancelado") {
                  return prev.filter(o => o.id !== updatedOrder.id)
                }
                const exists = prev.find(o => o.id === updatedOrder.id)
                if (exists) {
                   return prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)
                } else {
                   return [...prev, updatedOrder].sort((a, b) =>
                     new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                   )
                }
             })
          }
        }
      )
      .subscribe()

    return () => {
      supabase?.removeChannel(channel)
    }
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: "preparando" | "concluido" | "cancelado") => {
    if (!supabase) return

    // Optimistic update
    setOrders(prev => {
      if (newStatus === "concluido" || newStatus === "cancelado") {
        return prev.filter(o => o.id !== orderId)
      }
      return prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    })

    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)
  }

  const saveOrderEdits = async () => {
    if (!supabase || !editingOrder) return

    // Optimistic update
    setOrders(prev => prev.map(o => o.id === editingOrder.id ? editingOrder : o))

    await supabase.from("orders").update({
      items: editingOrder.items,
      total: editingOrder.total,
      delivery_fee: editingOrder.delivery_fee,
    }).eq("id", editingOrder.id)

    setEditingOrder(null)
  }

  // Play sound function wrapper using Web Audio API
  const playAlert = () => {
    if (!audioContextRef.current) return

    // Resume context if suspended (common browser policy requirement)
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume()
    }

    try {
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime) // 800Hz beep

      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime) // Initial volume
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.5) // Fade out

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.start()
      oscillator.stop(audioContextRef.current.currentTime + 0.5)
    } catch (e) {
      console.log("Erro ao tocar áudio ou bloqueado pelo navegador:", e)
    }
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Header bar */}
      <div className="bg-card border-b border-border p-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <ChefHat className="text-primary" size={24} />
          <h2 className="text-xl font-black text-foreground">Painel da Cozinha (KDS)</h2>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-sm font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            {orders.filter(o => o.status === "pendente").length} Pendentes
          </div>
          <button
            onClick={playAlert}
            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Testar som de alerta"
          >
            <BellRing size={14} /> Testar Som
          </button>
        </div>
      </div>

      <main className="p-4 md:p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <CheckCircle2 size={64} className="text-green-500 mb-4 opacity-50" />
            <h3 className="text-2xl font-black text-foreground">Nenhum pedido pendente!</h3>
            <p className="text-muted-foreground mt-2">A cozinha está limpa no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 items-start">
            {orders.map(order => (
              <div
                key={order.id}
                className={`bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col ${
                  order.status === "pendente" ? "border-amber-300 shadow-amber-100" : "border-border"
                }`}
              >
                {/* Card Header */}
                <div className={`p-3 md:p-4 border-b flex justify-between items-center ${
                  order.status === "pendente" ? "bg-amber-50" : "bg-muted/30"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-lg">
                      #{order.order_number ? `P${order.order_number}` : order.id.slice(0, 5).toUpperCase()}
                    </span>
                    <span className={`text-[10px] uppercase font-black px-2 py-1 rounded-md ${
                      order.status === "pendente" ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm font-bold text-muted-foreground">
                      <Clock size={14} />
                      {new Date(order.created_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <button
                      onClick={() => setEditingOrder(order)}
                      className="p-1.5 text-muted-foreground hover:text-primary bg-background border border-border rounded-md transition-colors"
                      title="Editar Pedido"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Tem certeza que deseja cancelar e excluir este pedido? Ele sumirá do histórico do cliente.")) {
                          updateOrderStatus(order.id, "cancelado")
                        }
                      }}
                      className="p-1.5 text-muted-foreground hover:text-destructive bg-background border border-border rounded-md transition-colors"
                      title="Excluir Pedido"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4 flex-1">
                  <ul className="space-y-3">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                        <div className="flex gap-2">
                          <span className="font-black text-primary">{item.quantity}x</span>
                          <span className="font-bold text-foreground">{item.name}</span>
                        </div>
                        {item.observations && (
                          <div className="mt-1 ml-6 flex items-start gap-1 bg-destructive/5 text-destructive p-2 rounded-lg text-sm font-medium">
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            <span>{item.observations}</span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Order Meta Data */}
                <div className="bg-muted/30 p-4 border-t border-border space-y-2 text-sm">
                  {order.delivery_address ? (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin size={16} className="shrink-0 mt-0.5 text-primary" />
                      <div>
                        <span className="font-bold text-foreground">Entrega: </span>
                        {order.delivery_address.street}, {order.delivery_address.number} - {order.delivery_address.neighborhood}
                        {order.delivery_address.complement && ` (${order.delivery_address.complement})`}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin size={16} className="shrink-0 mt-0.5 text-amber-500" />
                      <span className="font-bold text-foreground">Retirada no Balcão</span>
                    </div>
                  )}

                  <div className="flex items-start gap-2 text-muted-foreground">
                    <DollarSign size={16} className="shrink-0 mt-0.5 text-green-500" />
                    <div>
                      <span className="font-bold text-foreground">Pagamento: </span>
                      <span className="capitalize">{order.payment_method}</span>
                      {order.change_for && order.change_for > order.total && (
                        <span className="text-amber-600 ml-1 font-bold">
                          (Troco para R$ {order.change_for.toFixed(2).replace('.', ',')})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3 md:p-4 border-t border-border flex gap-2">
                  {order.status === "pendente" ? (
                    <button
                      onClick={() => updateOrderStatus(order.id, "preparando")}
                      className="w-full py-3 bg-blue-500 text-white rounded-lg font-black hover:bg-blue-600 transition-colors shadow-sm active:scale-[0.98]"
                    >
                      Iniciar Preparo
                    </button>
                  ) : (
                    <button
                      onClick={() => updateOrderStatus(order.id, "concluido")}
                      className="w-full py-3 bg-green-500 text-white rounded-lg font-black hover:bg-green-600 transition-colors shadow-sm active:scale-[0.98]"
                    >
                      Marcar como Concluído
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="font-black text-lg">
                Editar Pedido #{editingOrder.order_number ? `P${editingOrder.order_number}` : editingOrder.id.slice(0, 5).toUpperCase()}
              </h2>
              <button onClick={() => setEditingOrder(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              <div>
                <h3 className="font-bold mb-2">Itens do Pedido</h3>
                <div className="space-y-3">
                  {editingOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-muted/20 p-2 rounded-lg border border-border">
                      <div className="flex-1">
                        <div className="font-bold text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">R$ {item.price.toFixed(2).replace('.', ',')} cada</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 0
                            const newItems = [...editingOrder.items]
                            if (newQty === 0) {
                              newItems.splice(idx, 1)
                            } else {
                              newItems[idx].quantity = newQty
                            }

                            // Recalculate total
                            const newItemsTotal = newItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)
                            const newTotal = newItemsTotal + editingOrder.delivery_fee

                            setEditingOrder({...editingOrder, items: newItems, total: newTotal})
                          }}
                          className="w-16 border border-input bg-background rounded-md p-1 text-center font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Taxa de Entrega (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingOrder.delivery_fee}
                    onChange={(e) => {
                      const newFee = parseFloat(e.target.value) || 0
                      const itemsTotal = editingOrder.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)
                      setEditingOrder({...editingOrder, delivery_fee: newFee, total: itemsTotal + newFee})
                    }}
                    className="w-full border border-input bg-background rounded-md p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Total do Pedido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingOrder.total}
                    onChange={(e) => {
                      setEditingOrder({...editingOrder, total: parseFloat(e.target.value) || 0})
                    }}
                    className="w-full border border-input bg-background rounded-md p-2 font-black text-primary"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/30 flex gap-3">
              <button
                onClick={() => setEditingOrder(null)}
                className="flex-1 py-2 font-bold bg-background border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveOrderEdits}
                className="flex-1 py-2 font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

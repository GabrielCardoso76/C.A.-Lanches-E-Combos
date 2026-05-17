"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useCart } from "@/components/cart-context"
import { WHATSAPP_NUMBER } from "@/lib/menu-data"
import { X, MapPin, Store, CreditCard, Banknote, Landmark, Smartphone, ChevronRight } from "lucide-react"
import Link from "next/link"

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, totalPrice, clearCart } = useCart()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Settings
  const [estimatedTime, setEstimatedTime] = useState("30 a 45 min")
  const [isOpenStore, setIsOpenStore] = useState<boolean>(true)

  // Checkout State
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup" | null>(null)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [changeFor, setChangeFor] = useState("")

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setStep(1)
      setDeliveryMethod(null)
      setSelectedAddress(null)
      setPaymentMethod(null)
      setChangeFor("")
      return
    }

    async function fetchCheckoutData() {
      if (!supabase) return

      // Fetch settings (time and open status)
      const { data: settings } = await supabase.from("settings").select("estimated_time, is_open").eq("id", 1).single()
      if (settings) {
        setEstimatedTime(settings.estimated_time)
        setIsOpenStore(settings.is_open)
      }

      // Fetch user and addresses
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: addrData } = await supabase
          .from("addresses")
          .select("*, neighborhood:neighborhood_id(*)")
          .eq("profile_id", user.id)
        if (addrData) {
          setAddresses(addrData)
          if (addrData.length === 1) {
            setSelectedAddress(addrData[0])
          }
        }
      }
    }

    fetchCheckoutData()
  }, [isOpen])

  const deliveryFee = deliveryMethod === "delivery" && selectedAddress ? Number(selectedAddress.neighborhood.delivery_fee) : 0
  const finalTotal = totalPrice + deliveryFee

  const handleNextStep = () => {
    if (step === 1) {
      if (deliveryMethod === "delivery" && !selectedAddress) {
        alert("Por favor, selecione um endereço de entrega.")
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!paymentMethod) {
        alert("Por favor, selecione uma forma de pagamento.")
        return
      }
      if (paymentMethod === "Dinheiro" && changeFor && Number(changeFor.replace(",", ".")) < finalTotal) {
        alert("O valor do troco deve ser maior que o total do pedido.")
        return
      }
      setStep(3)
    }
  }

  const handleFinalize = async () => {
    setLoading(true)

    const parsedChangeFor = changeFor ? parseFloat(changeFor.replace(",", ".")) : null

    // 1. Save to database
    let orderNumberDisplay = ""
    if (supabase) {
      const orderData = {
        profile_id: user?.id || null,
        items: items,
        total: finalTotal,
        payment_method: paymentMethod,
        change_for: parsedChangeFor,
        delivery_fee: deliveryFee,
        delivery_address: deliveryMethod === "delivery" ? {
          street: selectedAddress.street,
          number: selectedAddress.number,
          neighborhood: selectedAddress.neighborhood.name,
          complement: selectedAddress.complement,
          reference: selectedAddress.reference
        } : null,
        status: "pendente"
      }

      const { data, error } = await supabase.from("orders").insert([orderData]).select('order_number').single()
      if (error) {
        console.error("Error saving order:", error)
        alert("Houve um erro ao registrar seu pedido. Tente novamente.")
        setLoading(false)
        return
      }
      if (data && data.order_number) {
        orderNumberDisplay = `#P${data.order_number}`
      }
    }

    // 2. Generate WhatsApp Message
    let message = `Olá! Gostaria de fazer o seguinte pedido${orderNumberDisplay ? ` (*${orderNumberDisplay}*)` : ''}:\n\n`

    items.forEach((item, index) => {
      const itemName = item.name.trim()
      message += `${index + 1}. *${itemName}* x${item.quantity} — R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}\n`
      if (item.observations && item.observations.trim().length > 0) {
        message += `   _Obs: ${item.observations.trim()}_\n`
      }
    })

    message += `\n*Subtotal:* R$ ${totalPrice.toFixed(2).replace(".", ",")}`

    if (deliveryMethod === "delivery") {
      message += `\n*Taxa de Entrega:* R$ ${deliveryFee.toFixed(2).replace(".", ",")}`
      message += `\n*Endereço:* ${selectedAddress.street}, ${selectedAddress.number} - ${selectedAddress.neighborhood.name}`
      if (selectedAddress.complement) message += ` (${selectedAddress.complement})`
    } else {
      message += `\n*Retirada no Balcão*`
    }

    message += `\n\n*TOTAL: R$ ${finalTotal.toFixed(2).replace(".", ",")}*`

    message += `\n\n*Pagamento:* ${paymentMethod}`
    if (paymentMethod === "Dinheiro" && parsedChangeFor) {
      message += ` (Troco para R$ ${parsedChangeFor.toFixed(2).replace(".", ",")})`
    }

    message += `\n*Tempo Estimado:* ${estimatedTime}`

    // 3. Clear cart and Redirect
    clearCart()

    // Explicitly clean any potential storage that might be used by a theoretical future implementation,
    // ensuring we do NOT clear authentication tokens.
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("cart")
      document.cookie = "cart=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    }

    setLoading(false)
    onClose()

    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex justify-center items-end sm:items-center">
      <div className="w-full max-w-lg bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
          <h2 className="font-black text-lg">Finalizar Pedido</h2>
          <button onClick={onClose} className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Step 1: Delivery Method */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h3 className="font-bold text-foreground">1. Como deseja receber?</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDeliveryMethod("delivery")}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    deliveryMethod === "delivery" ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50 text-muted-foreground"
                  }`}
                >
                  <MapPin size={32} className="mb-2" />
                  <span className="font-bold">Entrega</span>
                </button>
                <button
                  onClick={() => {
                    setDeliveryMethod("pickup")
                    setSelectedAddress(null)
                  }}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                    deliveryMethod === "pickup" ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50 text-muted-foreground"
                  }`}
                >
                  <Store size={32} className="mb-2" />
                  <span className="font-bold">Retirar no Balcão</span>
                </button>
              </div>

              {deliveryMethod === "delivery" && (
                <div className="mt-6 space-y-3 bg-muted/20 p-4 rounded-xl border border-border">
                  <h4 className="font-bold text-sm">Endereço de Entrega</h4>
                  {!user ? (
                    <div className="text-center p-4 bg-background rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-3">Faça login para selecionar ou cadastrar um endereço.</p>
                      <Link href="/login" onClick={onClose} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm">
                        Fazer Login
                      </Link>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center p-4 bg-background rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground mb-3">Você não tem endereços cadastrados.</p>
                      <Link href="/profile" onClick={onClose} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm">
                        Cadastrar Endereço
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {addresses.map(addr => (
                        <label key={addr.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedAddress?.id === addr.id ? "border-primary bg-primary/5" : "border-border bg-background"}`}>
                          <input
                            type="radio"
                            name="address"
                            className="mt-1 accent-primary"
                            checked={selectedAddress?.id === addr.id}
                            onChange={() => setSelectedAddress(addr)}
                          />
                          <div className="flex-1">
                            <p className="font-bold text-sm">{addr.street}, {addr.number}</p>
                            <p className="text-xs text-muted-foreground">{addr.neighborhood.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-primary">+ R$ {addr.neighborhood.delivery_fee.toFixed(2)}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <h3 className="font-bold text-foreground">2. Forma de Pagamento</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "Dinheiro", icon: <Banknote size={24} /> },
                  { id: "Pix", icon: <Smartphone size={24} /> },
                  { id: "Débito", icon: <CreditCard size={24} /> },
                  { id: "Crédito", icon: <CreditCard size={24} /> },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => {
                      setPaymentMethod(method.id)
                      if (method.id !== "Dinheiro") setChangeFor("")
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === method.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50 text-muted-foreground"
                    }`}
                  >
                    {method.icon}
                    <span className="font-bold">{method.id}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === "Dinheiro" && (
                <div className="mt-4 p-4 bg-muted/20 border border-border rounded-xl">
                  <label className="block text-sm font-bold mb-2">Precisa de troco para quanto?</label>
                  <input
                    type="text"
                    placeholder="Ex: 50,00"
                    value={changeFor}
                    onChange={(e) => setChangeFor(e.target.value)}
                    className="w-full border border-input rounded-lg p-3 bg-background focus:ring-2 focus:ring-primary outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Deixe em branco se não precisar de troco.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              {!isOpenStore && (
                <div className="text-center bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 mb-4 animate-pulse">
                  <h3 className="font-black text-lg">A loja está fechada no momento!</h3>
                  <p className="text-sm mt-1">Você não poderá concluir o pedido agora.</p>
                </div>
              )}

              <div className="text-center bg-green-500/10 text-green-700 p-4 rounded-xl border border-green-500/20">
                <h3 className="font-black text-lg">Quase lá!</h3>
                <p className="text-sm mt-1">Confira seu pedido antes de enviar para o WhatsApp.</p>
              </div>

              <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border text-sm">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
                </div>
                {deliveryMethod === "delivery" ? (
                  <>
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Taxa de Entrega</span>
                      <span className="font-bold">R$ {deliveryFee.toFixed(2).replace(".", ",")}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Endereço de Entrega:</span>
                      <span className="font-medium block">{selectedAddress.street}, {selectedAddress.number} - {selectedAddress.neighborhood.name}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Retirada</span>
                    <span className="font-bold text-green-600">Grátis</span>
                  </div>
                )}

                <div className="pt-2">
                  <span className="text-muted-foreground block mb-1">Pagamento:</span>
                  <span className="font-medium block">{paymentMethod} {changeFor ? `(Troco para R$ ${changeFor})` : ""}</span>
                </div>

                <div className="flex justify-between items-center pt-3 mt-3 border-t border-border">
                  <span className="font-black text-lg">Total</span>
                  <span className="font-black text-xl text-primary">R$ {finalTotal.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card">
          {step === 1 && (
            <button
              onClick={handleNextStep}
              disabled={!deliveryMethod || (deliveryMethod === "delivery" && !selectedAddress)}
              className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Continuar <ChevronRight size={18} />
            </button>
          )}
          {step === 2 && (
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleNextStep}
                disabled={!paymentMethod}
                className="flex-1 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Revisar Pedido <ChevronRight size={18} />
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                disabled={loading}
                className="px-4 py-3 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                onClick={handleFinalize}
                disabled={loading || !isOpenStore}
                className="flex-1 bg-[#25D366] text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-[#20b958] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Enviando..." : (isOpenStore ? "Confirmar e Enviar Pedido" : "Loja Fechada")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

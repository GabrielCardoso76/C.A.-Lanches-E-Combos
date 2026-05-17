"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, Home, KeyRound, Plus, Trash2, MapPin, ArrowLeft, Eye, EyeOff, ShoppingBag, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Neighborhood {
  id: string
  name: string
  delivery_fee: number
}

interface Address {
  id: string
  street: string
  number: string
  complement?: string
  reference?: string
  neighborhood: Neighborhood
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Passwords
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([])
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState({
    cep: "", street: "", number: "", complement: "", reference: "", neighborhood_id: ""
  })
  const [fetchingCep, setFetchingCep] = useState(false)

  // Orders History
  const [orders, setOrders] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"dados" | "pedidos">("dados")

  useEffect(() => {
    async function getUser() {
      if (!supabase) return setLoading(false)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }
      setUser(user)

      // Fetch Profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (profileData) setProfile(profileData)

      // Fetch Addresses
      const { data: addrData } = await supabase
        .from("addresses")
        .select("*, neighborhood:neighborhood_id(*)")
        .eq("profile_id", user.id)

      if (addrData) setAddresses(addrData as any[])

      // Fetch Neighborhoods for form
      const { data: neighData } = await supabase.from("neighborhoods").select("*").order("name")
      if (neighData) {
        setNeighborhoods(neighData)
        if (neighData.length > 0) {
          setAddressForm(prev => ({ ...prev, neighborhood_id: neighData[0].id }))
        }
      }

      // Fetch Orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("profile_id", user.id)
        .neq("status", "cancelado")
        .order("created_at", { ascending: false })

      if (ordersData) setOrders(ordersData)

      setLoading(false)
    }

    getUser()
  }, [router])

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || newPassword.length < 6) return

    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)

    if (error) {
      alert("Erro ao atualizar senha.")
    } else {
      alert("Senha atualizada com sucesso!")
      setNewPassword("")
    }
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !user) return

    const { data, error } = await supabase.from("addresses").insert([{
      profile_id: user.id,
      ...addressForm
    }]).select("*, neighborhood:neighborhood_id(*)").single()

    if (!error && data) {
      setAddresses(prev => [...prev, data as any])
      setIsAddingAddress(false)
      setAddressForm({ cep: "", street: "", number: "", complement: "", reference: "", neighborhood_id: neighborhoods[0]?.id || "" })
    } else {
      alert("Erro ao salvar endereço.")
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!supabase || !confirm("Tem certeza que deseja apagar este endereço?")) return
    const { error } = await supabase.from("addresses").delete().eq("id", id)
    if (!error) {
      setAddresses(prev => prev.filter(a => a.id !== id))
    }
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let cep = e.target.value.replace(/\D/g, "")
    if (cep.length > 8) cep = cep.slice(0, 8)

    setAddressForm(prev => ({ ...prev, cep }))

    if (cep.length === 8) {
      setFetchingCep(true)
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await res.json()

        if (!data.erro) {
          // Verify if it is São Carlos
          if (data.localidade === "São Carlos") {
            let n_id = ""
            // Try to find the neighborhood
            const foundNeighborhood = neighborhoods.find(n => n.name.toLowerCase() === data.bairro.toLowerCase())

            if (foundNeighborhood) {
              n_id = foundNeighborhood.id
            } else if (supabase) {
              // Create the neighborhood if it doesn't exist
              const { data: newN, error: newNError } = await supabase
                .from("neighborhoods")
                .insert([{ name: data.bairro, delivery_fee: 0 }])
                .select()
                .single()

              if (!newNError && newN) {
                setNeighborhoods(prev => [...prev, newN].sort((a, b) => a.name.localeCompare(b.name)))
                n_id = newN.id
              }
            }

            setAddressForm(prev => ({
              ...prev,
              street: data.logradouro,
              neighborhood_id: n_id || prev.neighborhood_id
            }))
          } else {
            alert("Atualmente só entregamos em São Carlos - SP.")
          }
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error)
      } finally {
        setFetchingCep(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 pb-20 p-4 pt-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-black text-foreground">Meu Perfil</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-destructive font-bold text-sm hover:underline"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Tabs */}
        <div className="flex bg-muted/50 p-1 rounded-xl w-full max-w-md mx-auto border border-border/50">
          <button
            onClick={() => setActiveTab("dados")}
            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === "dados" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home size={16} /> Meus Dados
          </button>
          <button
            onClick={() => setActiveTab("pedidos")}
            className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === "pedidos" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag size={16} /> Meus Pedidos
          </button>
        </div>

        {activeTab === "dados" ? (
          <div className="space-y-6">
            {/* User Info */}
            <section className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl font-black">
              {profile?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-xl font-black">{profile?.full_name || "Usuário"}</h2>
              <p className="text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
        </section>

        {/* Change Password */}
        <section className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound size={20} className="text-primary" />
            <h3 className="text-lg font-bold">Alterar Senha</h3>
          </div>
          <form onSubmit={handleUpdatePassword} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Nova senha (mín. 6 caracteres)"
                className="w-full border border-input rounded-lg p-2.5 pr-10 bg-background focus:ring-2 focus:ring-primary outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={savingPassword || newPassword.length < 6}
              className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {savingPassword ? "Salvando..." : "Atualizar"}
            </button>
          </form>
        </section>

        {/* Addresses */}
        <section className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Home size={20} className="text-primary" />
              <h3 className="text-lg font-bold">Meus Endereços</h3>
            </div>
            {!isAddingAddress && (
              <button
                onClick={() => setIsAddingAddress(true)}
                className="flex items-center gap-1 text-sm font-bold bg-muted px-3 py-1.5 rounded-lg hover:bg-muted/80 transition-colors"
              >
                <Plus size={16} /> Adicionar
              </button>
            )}
          </div>

          {isAddingAddress && (
            <form onSubmit={handleSaveAddress} className="mb-6 bg-muted/30 p-4 rounded-xl border border-border">
              <h4 className="font-bold mb-3 text-sm">Novo Endereço</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="sm:col-span-2 flex gap-3">
                  <div className="w-1/3">
                    <label className="block text-xs font-bold text-muted-foreground mb-1">CEP (Opcional)</label>
                    <input
                      value={addressForm.cep}
                      onChange={handleCepChange}
                      type="text"
                      placeholder="00000-000"
                      className={`w-full border ${fetchingCep ? 'border-primary ring-1 ring-primary' : 'border-input'} rounded-lg p-2 text-sm bg-background transition-colors`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Rua / Avenida *</label>
                    <input required value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} type="text" className="w-full border border-input rounded-lg p-2 text-sm bg-background" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Número *</label>
                  <input required value={addressForm.number} onChange={e => setAddressForm({...addressForm, number: e.target.value})} type="text" className="w-full border border-input rounded-lg p-2 text-sm bg-background" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Bairro *</label>
                  <select required value={addressForm.neighborhood_id} onChange={e => setAddressForm({...addressForm, neighborhood_id: e.target.value})} className="w-full border border-input rounded-lg p-2 text-sm bg-background">
                    {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name} (Taxa: R$ {n.delivery_fee.toFixed(2)})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Complemento</label>
                  <input value={addressForm.complement} onChange={e => setAddressForm({...addressForm, complement: e.target.value})} type="text" className="w-full border border-input rounded-lg p-2 text-sm bg-background" placeholder="Apto, Bloco..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Ponto de Referência</label>
                  <input value={addressForm.reference} onChange={e => setAddressForm({...addressForm, reference: e.target.value})} type="text" className="w-full border border-input rounded-lg p-2 text-sm bg-background" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsAddingAddress(false)} className="flex-1 py-2 border border-border bg-background rounded-lg font-bold text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm">Salvar Endereço</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {addresses.length === 0 && !isAddingAddress ? (
              <p className="text-sm text-muted-foreground text-center py-4">Você ainda não tem endereços cadastrados.</p>
            ) : (
              addresses.map(addr => (
                <div key={addr.id} className="flex items-start justify-between p-3 border border-border rounded-xl">
                  <div className="flex gap-3">
                    <MapPin className="text-primary shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="font-bold text-sm text-foreground">{addr.street}, {addr.number}</p>
                      <p className="text-xs text-muted-foreground">{addr.neighborhood?.name}</p>
                      {addr.complement && <p className="text-xs text-muted-foreground">{addr.complement}</p>}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteAddress(addr.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-black mb-4">Histórico de Pedidos</h2>
            {orders.length === 0 ? (
              <div className="bg-card border border-border p-8 rounded-2xl text-center shadow-sm">
                <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-bold">Nenhum pedido encontrado</h3>
                <p className="text-muted-foreground mt-2">Você ainda não realizou nenhum pedido conosco.</p>
                <Link href="/" className="inline-block mt-4 bg-primary text-primary-foreground font-bold px-6 py-2 rounded-lg">
                  Fazer um pedido
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg">#{order.order_number ? `P${order.order_number}` : order.id.slice(0,5).toUpperCase()}</span>
                        <span className={`text-xs uppercase font-bold px-2 py-1 rounded-md ${
                          order.status === "pendente" ? "bg-amber-100 text-amber-800 border border-amber-200" :
                          order.status === "preparando" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                          "bg-green-100 text-green-800 border border-green-200"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground font-medium">
                        <Clock size={14} />
                        {new Date(order.created_at).toLocaleDateString("pt-BR")} {new Date(order.created_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <ul className="space-y-1 py-1">
                      {order.items.map((item: any, idx: number) => (
                        <li key={idx} className="flex gap-2 text-sm">
                          <span className="font-black text-primary">{item.quantity}x</span>
                          <span className="font-medium">{item.name}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex justify-between items-end border-t border-border pt-3 mt-1">
                      <div className="text-sm text-muted-foreground">
                        {order.delivery_address ? "Entrega" : "Retirada"} • <span className="capitalize">{order.payment_method}</span>
                      </div>
                      <div className="font-black text-lg">
                        R$ {Number(order.total).toFixed(2).replace(".", ",")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, Home, KeyRound, Plus, Trash2, MapPin, ArrowLeft } from "lucide-react"

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
  const [savingPassword, setSavingPassword] = useState(false)

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([])
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState({
    street: "", number: "", complement: "", reference: "", neighborhood_id: ""
  })

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
      setAddressForm({ street: "", number: "", complement: "", reference: "", neighborhood_id: neighborhoods[0]?.id || "" })
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-muted/20">Carregando...</div>
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
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Nova senha (mín. 6 caracteres)"
              className="flex-1 border border-input rounded-lg p-2.5 bg-background focus:ring-2 focus:ring-primary outline-none"
            />
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
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Rua / Avenida *</label>
                  <input required value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} type="text" className="w-full border border-input rounded-lg p-2 text-sm bg-background" />
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
      </main>
    </div>
  )
}

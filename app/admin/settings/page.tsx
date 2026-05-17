"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Pencil, Trash2, Save, Clock } from "lucide-react"
import { WeeklySchedule, DailySchedule } from "@/lib/business-hours"
import { Skeleton } from "@/components/ui/skeleton"

interface Neighborhood {
  id: string
  name: string
  delivery_fee: number
}

const daysOfWeekStr = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado"
];

export default function SettingsPage() {
  const [estimatedTime, setEstimatedTime] = useState("30 a 45 min")
  const [savingTime, setSavingTime] = useState(false)

  const [schedule, setSchedule] = useState<WeeklySchedule>({})
  const [savingSchedule, setSavingSchedule] = useState(false)

  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [loadingNeigborhoods, setLoadingNeighborhoods] = useState(true)

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formName, setFormName] = useState("")
  const [formFee, setFormFee] = useState("")

  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        setLoadingNeighborhoods(false)
        return
      }

      // Fetch settings
      const { data: settingsData } = await supabase.from("settings").select("estimated_time, schedule").eq("id", 1).single()
      if (settingsData) {
        setEstimatedTime(settingsData.estimated_time)
        if (settingsData.schedule) {
          setSchedule(settingsData.schedule)
        }
      }

      // Fetch neighborhoods
      const { data: neigData } = await supabase.from("neighborhoods").select("*").order("name")
      if (neigData) {
        setNeighborhoods(neigData)
      }
      setLoadingNeighborhoods(false)
    }

    fetchData()
  }, [])

  const saveEstimatedTime = async () => {
    if (!supabase) return
    setSavingTime(true)
    await supabase.from("settings").update({ estimated_time: estimatedTime }).eq("id", 1)
    setSavingTime(false)
    alert("Tempo estimado atualizado com sucesso!")
  }

  const handleScheduleChange = (dayIndex: string, field: keyof DailySchedule, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [field]: value
      }
    }))
  }

  const saveSchedule = async () => {
    if (!supabase) return
    setSavingSchedule(true)
    await supabase.from("settings").update({ schedule }).eq("id", 1)
    setSavingSchedule(false)
    alert("Horários de funcionamento atualizados com sucesso!")
  }

  const handleSaveNeighborhood = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !formName || !formFee) return

    const fee = parseFloat(formFee.replace(",", "."))

    if (editingId) {
      const { data, error } = await supabase
        .from("neighborhoods")
        .update({ name: formName, delivery_fee: fee })
        .eq("id", editingId)
        .select()
        .single()

      if (!error && data) {
        setNeighborhoods(prev => prev.map(n => n.id === editingId ? data : n))
      }
    } else {
      const { data, error } = await supabase
        .from("neighborhoods")
        .insert([{ name: formName, delivery_fee: fee }])
        .select()
        .single()

      if (!error && data) {
        setNeighborhoods(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      }
    }

    setIsAdding(false)
    setEditingId(null)
    setFormName("")
    setFormFee("")
  }

  const startEdit = (n: Neighborhood) => {
    setEditingId(n.id)
    setFormName(n.name)
    setFormFee(n.delivery_fee.toString())
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm("Tem certeza que deseja excluir este bairro?")) return
    const { error } = await supabase.from("neighborhoods").delete().eq("id", id)
    if (!error) {
      setNeighborhoods(prev => prev.filter(n => n.id !== id))
    }
  }

  return (
    <div className="pb-20">
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <h2 className="text-2xl font-black text-foreground mb-6">Configurações da Loja</h2>

        {/* Business Hours Section */}
        <section className="bg-card border border-border p-6 rounded-xl shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-primary" size={24} />
            <h3 className="text-lg font-bold text-foreground">Horários de Funcionamento (Automático)</h3>
          </div>

          <div className="space-y-4 mb-6">
            {daysOfWeekStr.map((day, index) => {
              const daySchedule = schedule[index.toString()] || { isOpen: false, open: "18:00", close: "23:00" }

              return (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-muted/30 border border-border rounded-lg">
                  <div className="w-full sm:w-36 flex items-center justify-between sm:justify-start gap-2">
                    <span className="font-bold text-sm">{day}</span>
                    <label className="relative inline-flex items-center cursor-pointer sm:hidden">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={daySchedule.isOpen}
                        onChange={(e) => handleScheduleChange(index.toString(), "isOpen", e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={daySchedule.isOpen}
                        onChange={(e) => handleScheduleChange(index.toString(), "isOpen", e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                    <span className="text-xs text-muted-foreground w-12">{daySchedule.isOpen ? "Aberto" : "Fechado"}</span>
                  </div>

                  <div className={`flex items-center gap-2 flex-1 ${!daySchedule.isOpen && 'opacity-50 pointer-events-none'}`}>
                    <input
                      type="time"
                      value={daySchedule.open}
                      onChange={(e) => handleScheduleChange(index.toString(), "open", e.target.value)}
                      className="border border-input rounded-md p-1.5 text-sm bg-background"
                    />
                    <span className="text-muted-foreground text-sm">até</span>
                    <input
                      type="time"
                      value={daySchedule.close}
                      onChange={(e) => handleScheduleChange(index.toString(), "close", e.target.value)}
                      className="border border-input rounded-md p-1.5 text-sm bg-background"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={saveSchedule}
            disabled={savingSchedule}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {savingSchedule ? "Salvando..." : "Salvar Horários"}
          </button>
        </section>

        {/* Estimated Time Section */}
        <section className="bg-card border border-border p-6 rounded-xl shadow-sm mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Tempo Estimado de Entrega/Preparo</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              className="flex-1 border border-input rounded-lg p-2 bg-background focus:ring-2 focus:ring-primary outline-none"
              placeholder="Ex: 30 a 45 min"
            />
            <button
              onClick={saveEstimatedTime}
              disabled={savingTime}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {savingTime ? "Salvando..." : "Salvar Tempo"}
            </button>
          </div>
        </section>

        {/* Neighborhoods Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-foreground">Bairros e Taxas de Entrega</h3>
            {!isAdding && (
              <button
                onClick={() => {
                  setFormName("")
                  setFormFee("")
                  setEditingId(null)
                  setIsAdding(true)
                }}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-sm text-sm"
              >
                <Plus size={16} />
                Adicionar Bairro
              </button>
            )}
          </div>

          {isAdding && (
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm mb-4">
              <h4 className="font-bold mb-3">{editingId ? "Editar Bairro" : "Novo Bairro"}</h4>
              <form onSubmit={handleSaveNeighborhood} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Nome do Bairro</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full border border-input rounded-lg p-2 bg-background focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ex: Centro"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Taxa (R$)</label>
                  <input
                    type="text"
                    required
                    value={formFee}
                    onChange={(e) => setFormFee(e.target.value)}
                    className="w-full border border-input rounded-lg p-2 bg-background focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ex: 5,00"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-2 px-4 border border-border rounded-lg font-bold hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            {loadingNeigborhoods ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ) : neighborhoods.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Nenhum bairro cadastrado ainda.</div>
            ) : (
              <ul className="divide-y divide-border">
                {neighborhoods.map(n => (
                  <li key={n.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-bold text-foreground">{n.name}</p>
                      <p className="text-sm text-primary font-medium">R$ {n.delivery_fee.toFixed(2).replace(".", ",")}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(n)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

      </main>
    </div>
  )
}

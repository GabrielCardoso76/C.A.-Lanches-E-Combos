"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { DollarSign, TrendingUp, CreditCard, Banknote, Landmark, Calendar } from "lucide-react"

export default function FinanceDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pix: 0,
    dinheiro: 0,
    cartao: 0
  })

  // Grouped by Operational Date
  const [groupedData, setGroupedData] = useState<any[]>([])

  useEffect(() => {
    async function fetchFinances() {
      if (!supabase) return

      // Fetch only "concluido" orders
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "concluido")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching finances:", error)
        setLoading(false)
        return
      }

      if (data) {
        // Calculate Operational Date locally using -6h logic
        // For accurate tracking, map each order to its "YYYY-MM-DD" operational string
        const ordersWithOpDate = data.map(order => {
           // Get the date string in America/Sao_Paulo
           const tzDateString = new Date(order.created_at).toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
           const d = new Date(tzDateString)

           // subtract 6 hours for operational day
           d.setHours(d.getHours() - 6)

           // Format back as YYYY-MM-DD using local methods to avoid UTC shift
           const year = d.getFullYear()
           const month = String(d.getMonth() + 1).padStart(2, '0')
           const day = String(d.getDate()).padStart(2, '0')
           const opDate = `${year}-${month}-${day}`

           return { ...order, opDate }
        })

        // Group by opDate
        const groups: Record<string, any> = {}
        let overallTotal = 0
        let overallOrders = 0
        let overallPix = 0
        let overallDinheiro = 0
        let overallCartao = 0

        ordersWithOpDate.forEach(order => {
          const date = order.opDate
          if (!groups[date]) {
             groups[date] = { date, total: 0, orders: 0, pix: 0, dinheiro: 0, cartao: 0 }
          }

          const total = Number(order.total)
          groups[date].total += total
          groups[date].orders += 1

          overallTotal += total
          overallOrders += 1

          const method = order.payment_method?.toLowerCase() || ""
          if (method.includes("pix")) {
             groups[date].pix += total
             overallPix += total
          } else if (method.includes("dinheiro")) {
             groups[date].dinheiro += total
             overallDinheiro += total
          } else if (method.includes("cartão") || method.includes("cartao")) {
             groups[date].cartao += total
             overallCartao += total
          }
        })

        setMetrics({
          totalRevenue: overallTotal,
          totalOrders: overallOrders,
          pix: overallPix,
          dinheiro: overallDinheiro,
          cartao: overallCartao
        })

        // Sort descending by date
        const sortedGroups = Object.values(groups).sort((a, b) => b.date.localeCompare(a.date))
        setGroupedData(sortedGroups)
      }

      setLoading(false)
    }

    fetchFinances()
  }, [])

  const formatDateBR = (isoStr: string) => {
    const [year, month, day] = isoStr.split('-')
    return `${day}/${month}/${year}`
  }

  if (loading) {
    return <div className="p-6">Carregando financeiro...</div>
  }

  return (
    <div className="p-4 md:p-6 pb-24 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-2">
            <TrendingUp className="text-green-500" />
            Finanças
          </h1>
          <p className="text-muted-foreground mt-1">Relatório de caixa agrupado por Dia Operacional</p>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-bold">Faturamento Total</p>
            <p className="text-2xl font-black">R$ {metrics.totalRevenue.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-bold">Pedidos Concluídos</p>
            <p className="text-2xl font-black">{metrics.totalOrders}</p>
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl shadow-sm col-span-1 lg:col-span-2 flex flex-col justify-center">
          <p className="text-sm text-muted-foreground font-bold mb-2">Divisão por Método de Pagamento</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/30 p-2 rounded-lg text-center border border-border">
              <Landmark size={16} className="mx-auto mb-1 text-teal-500" />
              <div className="text-xs font-bold text-muted-foreground">PIX</div>
              <div className="font-black">R$ {metrics.pix.toFixed(2).replace('.', ',')}</div>
            </div>
            <div className="bg-muted/30 p-2 rounded-lg text-center border border-border">
              <Banknote size={16} className="mx-auto mb-1 text-green-500" />
              <div className="text-xs font-bold text-muted-foreground">Dinheiro</div>
              <div className="font-black">R$ {metrics.dinheiro.toFixed(2).replace('.', ',')}</div>
            </div>
            <div className="bg-muted/30 p-2 rounded-lg text-center border border-border">
              <CreditCard size={16} className="mx-auto mb-1 text-purple-500" />
              <div className="text-xs font-bold text-muted-foreground">Cartão</div>
              <div className="font-black">R$ {metrics.cartao.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* History by Date */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="font-black flex items-center gap-2">
            <Calendar size={18} /> Histórico por Dia Operacional
          </h2>
        </div>
        <div className="divide-y divide-border">
          {groupedData.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum dado financeiro encontrado.
            </div>
          ) : (
            groupedData.map((group) => (
              <div key={group.date} className="p-4 hover:bg-muted/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black text-lg">{formatDateBR(group.date)}</h3>
                    <p className="text-sm text-muted-foreground">{group.orders} pedidos concluídos</p>
                  </div>

                  <div className="flex gap-4">
                     <div className="text-right">
                       <p className="text-xs font-bold text-muted-foreground">Faturamento</p>
                       <p className="font-black text-lg text-green-600">R$ {group.total.toFixed(2).replace('.', ',')}</p>
                     </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-3 text-xs">
                  <span className="bg-teal-500/10 text-teal-700 px-2 py-1 rounded-md border border-teal-500/20 font-bold">
                    Pix: R$ {group.pix.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="bg-green-500/10 text-green-700 px-2 py-1 rounded-md border border-green-500/20 font-bold">
                    Din: R$ {group.dinheiro.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="bg-purple-500/10 text-purple-700 px-2 py-1 rounded-md border border-purple-500/20 font-bold">
                    Cart: R$ {group.cartao.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

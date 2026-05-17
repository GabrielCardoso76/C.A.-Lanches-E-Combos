"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { LogOut, Menu, X, Store } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { isStoreCurrentlyOpen } from "@/lib/business-hours"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [storeOpen, setStoreOpen] = useState(true)

  // Don't wrap login page with this layout
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  useEffect(() => {
    async function fetchSettings() {
      if (!supabase) return
      const { data } = await supabase.from("settings").select("is_open, schedule").eq("id", 1).single()
      if (data) {
        if (data.schedule) {
          const { isOpen } = isStoreCurrentlyOpen(data.schedule)
          setStoreOpen(isOpen)
        } else {
          setStoreOpen(data.is_open)
        }
      }
    }
    fetchSettings()

    // Keep-alive ping for Render
    const pingInterval = setInterval(() => {
      fetch("/api/ping").catch(console.error)
    }, 180000) // 3 minutes

    return () => clearInterval(pingInterval)
  }, [])

  const toggleStoreStatus = async () => {
    const newStatus = !storeOpen
    setStoreOpen(newStatus) // optimistic update
    if (supabase) {
      await supabase.from("settings").update({ is_open: newStatus }).eq("id", 1)
    }
  }

  const handleLogout = () => {
    Cookies.remove("admin_auth")
    router.push("/admin/login")
  }

  const navLinks = [
    { href: "/admin/kitchen", label: "Cozinha (KDS)" },
    { href: "/admin/financas", label: "Finanças" },
    { href: "/admin", label: "Produtos" },
    { href: "/admin/customers", label: "Clientes" },
    { href: "/admin/settings", label: "Configurações" },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-20">
        <h1 className="text-xl font-black text-foreground">Painel Admin</h1>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        fixed md:sticky top-0 left-0 z-10 w-64 h-screen bg-card border-r border-border transition-transform duration-300 flex flex-col
      `}>
        <div className="hidden md:block p-6 border-b border-border">
          <h1 className="text-2xl font-black text-foreground">Painel Admin</h1>
        </div>

        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store size={18} className={storeOpen ? "text-green-500" : "text-destructive"} />
                <span className="font-bold text-sm">Loja {storeOpen ? "Aberta" : "Fechada"}</span>
              </div>
              {/* Manual toggle is hidden because schedule is automatic now. It can be fully removed or kept as force override. Hiding for now to avoid confusion. */}
            </div>
            <p className="text-xs text-muted-foreground">O status da loja é atualizado automaticamente conforme os horários configurados.</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg font-bold transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg font-bold transition-colors"
          >
            <LogOut size={20} />
            Sair do sistema
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

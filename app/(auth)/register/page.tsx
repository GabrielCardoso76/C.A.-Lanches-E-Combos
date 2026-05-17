"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!supabase) {
      setError("Supabase não configurado.")
      setLoading(false)
      return
    }

    // 1. SignUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    alert("Cadastro realizado com sucesso!")
    router.push("/profile")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-sm bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-foreground">Criar Conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Preencha seus dados para pedir.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-input rounded-lg p-2.5 bg-background focus:ring-2 focus:ring-primary outline-none"
              placeholder="João da Silva"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-input rounded-lg p-2.5 bg-background focus:ring-2 focus:ring-primary outline-none"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-input rounded-lg p-2.5 pr-10 bg-background focus:ring-2 focus:ring-primary outline-none"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  )
}

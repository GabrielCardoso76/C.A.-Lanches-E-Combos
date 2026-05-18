import { supabaseAdmin } from "@/lib/supabase-admin"
import { User } from "lucide-react"

interface Profile {
  id: string
  full_name: string
  email: string
  created_at: string
}

export const revalidate = 0 // Disable cache to always fetch latest customers

export default async function CustomersPage() {
  let customers: Profile[] = []

  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      customers = data
    }
  }

  return (
    <div className="pb-20">
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <h2 className="text-2xl font-black text-foreground mb-6">Clientes Cadastrados</h2>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {customers.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <User size={32} className="text-muted-foreground" />
              </div>
              <p className="text-lg font-bold text-foreground">Nenhum cliente cadastrado</p>
              <p className="text-muted-foreground mt-1">Os clientes aparecerão aqui após se registrarem.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="p-4 font-bold text-foreground">Nome Completo</th>
                    <th className="p-4 font-bold text-foreground">Email</th>
                    <th className="p-4 font-bold text-foreground hidden sm:table-cell">Data de Cadastro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-medium text-foreground">{c.full_name}</td>
                      <td className="p-4 text-muted-foreground">{c.email}</td>
                      <td className="p-4 text-muted-foreground hidden sm:table-cell">
                        {new Date(c.created_at).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

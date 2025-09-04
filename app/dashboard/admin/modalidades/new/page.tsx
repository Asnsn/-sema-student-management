import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ModalidadeForm } from "@/components/modalidade-form"

export default async function NewModalidadePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verify admin role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Get available professors
  const { data: professores } = await supabase
    .from("profiles")
    .select("id, nome_completo, unidade")
    .eq("role", "professor")
    .eq("ativo", true)
    .order("nome_completo")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Nova Modalidade</h1>
          <p className="text-gray-600">Criar uma nova atividade ou esporte</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <ModalidadeForm professores={professores || []} />
        </div>
      </div>
    </div>
  )
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ModalidadeForm } from "@/components/modalidade-form"

interface EditModalidadePageProps {
  params: Promise<{ id: string }>
}

export default async function EditModalidadePage({ params }: EditModalidadePageProps) {
  const { id } = await params
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

  // Get modalidade data
  const { data: modalidade } = await supabase.from("modalidades").select("*").eq("id", id).single()

  if (!modalidade) {
    redirect("/dashboard/admin/modalidades")
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
          <h1 className="text-2xl font-bold text-gray-900">Editar Modalidade</h1>
          <p className="text-gray-600">Atualizar informações da atividade</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <ModalidadeForm modalidade={modalidade} professores={professores || []} />
        </div>
      </div>
    </div>
  )
}

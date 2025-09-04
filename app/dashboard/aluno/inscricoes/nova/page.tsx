import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { InscricaoForm } from "@/components/inscricao-form"

interface NovaInscricaoPageProps {
  searchParams: Promise<{ modalidade?: string }>
}

export default async function NovaInscricaoPage({ searchParams }: NovaInscricaoPageProps) {
  const { modalidade: modalidadeId } = await searchParams
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verify student role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile || profile.role !== "aluno") {
    redirect("/dashboard")
  }

  // Get modalidade details if specified
  let modalidade = null
  if (modalidadeId) {
    const { data: modalidadeData } = await supabase
      .from("modalidades")
      .select("*")
      .eq("id", modalidadeId)
      .eq("unidade", profile.unidade)
      .eq("ativo", true)
      .single()

    modalidade = modalidadeData
  }

  // Get available modalidades for student's unit
  const { data: modalidadesDisponiveis } = await supabase
    .from("modalidades")
    .select("*")
    .eq("unidade", profile.unidade)
    .eq("ativo", true)
    .order("nome")

  // Get student's current inscriptions
  const { data: inscricoesExistentes } = await supabase
    .from("inscricoes")
    .select("modalidade_id")
    .eq("aluno_id", data.user.id)

  const modalidadesJaInscritas = inscricoesExistentes?.map((i) => i.modalidade_id) || []

  // Filter available modalidades
  const modalidadesFiltradas = modalidadesDisponiveis?.filter((m) => !modalidadesJaInscritas.includes(m.id)) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Nova Inscrição</h1>
          <p className="text-gray-600">Inscreva-se em uma nova atividade</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <InscricaoForm
            modalidadeSelecionada={modalidade}
            modalidadesDisponiveis={modalidadesFiltradas}
            alunoId={data.user.id}
          />
        </div>
      </div>
    </div>
  )
}

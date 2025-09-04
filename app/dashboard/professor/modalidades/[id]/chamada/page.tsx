import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ChamadaForm } from "@/components/chamada-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface ChamadaPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ data?: string }>
}

export default async function ChamadaPage({ params, searchParams }: ChamadaPageProps) {
  const { id } = await params
  const { data: dataParam } = await searchParams
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verify professor role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  if (!profile || profile.role !== "professor") {
    redirect("/dashboard")
  }

  // Get modalidade info
  const { data: modalidade } = await supabase.from("modalidades").select("*").eq("id", id).single()

  if (!modalidade || (modalidade.professor_id !== data.user.id && profile.role !== "admin")) {
    redirect("/dashboard/professor")
  }

  // Get students enrolled in this modalidade
  const { data: inscricoes } = await supabase
    .from("inscricoes")
    .select(`
      *,
      profiles!inscricoes_aluno_id_fkey (
        id,
        nome_completo
      )
    `)
    .eq("modalidade_id", id)
    .eq("status", "ativo")
    .order("profiles(nome_completo)")

  // Get existing attendance for today (or selected date)
  const selectedDate = dataParam || new Date().toISOString().split("T")[0]

  const { data: presencasExistentes } = await supabase
    .from("presencas")
    .select("*")
    .eq("modalidade_id", id)
    .eq("data_aula", selectedDate)

  const presencasMap =
    presencasExistentes?.reduce(
      (acc, presenca) => {
        acc[presenca.aluno_id] = presenca
        return acc
      },
      {} as Record<string, any>,
    ) || {}

  const modalidadeLabels = {
    kung_fu: "Kung Fu",
    handebol: "Handebol",
    futebol_futsal: "Futebol/Futsal",
    volei: "Vôlei",
    ballet: "Ballet",
    jazz: "Jazz",
    zumba: "Zumba",
    capoeira: "Capoeira",
    bateria: "Bateria",
    croche: "Crochê",
    reforco_escolar: "Reforço Escolar",
    ingles: "Inglês",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/professor">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Chamada - {modalidadeLabels[modalidade.nome as keyof typeof modalidadeLabels]}
              </h1>
              <p className="text-gray-600">
                {new Date(selectedDate).toLocaleDateString("pt-BR")} • {inscricoes?.length || 0} alunos
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ChamadaForm
            modalidade={modalidade}
            alunos={inscricoes || []}
            presencasExistentes={presencasMap}
            dataAula={selectedDate}
            professorId={data.user.id}
          />
        </div>
      </div>
    </div>
  )
}

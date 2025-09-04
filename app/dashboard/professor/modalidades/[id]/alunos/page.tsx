import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Phone, Calendar } from "lucide-react"

interface ProfessorModalidadeAlunosPageProps {
  params: Promise<{ id: string }>
}

export default async function ProfessorModalidadeAlunosPage({ params }: ProfessorModalidadeAlunosPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Verify professor role and ownership
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
        nome_completo,
        telefone,
        data_nascimento,
        responsavel_nome,
        responsavel_telefone
      )
    `)
    .eq("modalidade_id", id)
    .eq("status", "ativo")
    .order("created_at")

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

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/professor">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Alunos - {modalidadeLabels[modalidade.nome as keyof typeof modalidadeLabels]}
              </h1>
              <p className="text-gray-600">
                {modalidade.horario_inicio} - {modalidade.horario_fim} • {modalidade.dias_semana?.join(", ")}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant="outline">{inscricoes?.length || 0} alunos ativos</Badge>
            <Badge variant="outline">{modalidade.vagas_maximas - (inscricoes?.length || 0)} vagas disponíveis</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inscricoes?.map((inscricao) => (
            <Card key={inscricao.id}>
              <CardHeader>
                <CardTitle className="text-lg">{inscricao.profiles?.nome_completo}</CardTitle>
                <CardDescription>Inscrito em {new Date(inscricao.data_inscricao).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inscricao.profiles?.data_nascimento && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {calculateAge(inscricao.profiles.data_nascimento)} anos
                    </div>
                  )}

                  {inscricao.profiles?.telefone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {inscricao.profiles.telefone}
                    </div>
                  )}

                  {inscricao.profiles?.responsavel_nome && (
                    <div className="text-sm text-gray-600">
                      <strong>Responsável:</strong> {inscricao.profiles.responsavel_nome}
                      {inscricao.profiles.responsavel_telefone && (
                        <div className="flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4" />
                          {inscricao.profiles.responsavel_telefone}
                        </div>
                      )}
                    </div>
                  )}

                  {inscricao.observacoes && (
                    <div className="text-sm text-gray-600">
                      <strong>Observações:</strong> {inscricao.observacoes}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/dashboard/professor/alunos/${inscricao.profiles?.id}/frequencia`}>Frequência</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Link href={`/dashboard/professor/modalidades/${id}/chamada?aluno=${inscricao.profiles?.id}`}>
                        Chamada
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {inscricoes?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhum aluno inscrito nesta modalidade ainda.</p>
            <Button asChild>
              <Link href="/dashboard/professor/inscricoes">Gerenciar Inscrições</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

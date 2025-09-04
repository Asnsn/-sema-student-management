import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Users, Clock, CheckCircle } from "lucide-react"

export default async function ProfessorPresencaPage() {
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

  // Get professor's modalidades
  const { data: modalidades } = await supabase
    .from("modalidades")
    .select("*")
    .eq("professor_id", data.user.id)
    .eq("ativo", true)
    .order("nome")

  // Get recent attendance records for professor's modalidades
  const modalidadeIds = modalidades?.map((m) => m.id) || []

  let presencasRecentes: any[] = []
  if (modalidadeIds.length > 0) {
    const { data: presencasData } = await supabase
      .from("presencas")
      .select(`
        *,
        modalidades (
          nome
        ),
        profiles!presencas_aluno_id_fkey (
          nome_completo
        )
      `)
      .in("modalidade_id", modalidadeIds)
      .order("data_aula", { ascending: false })
      .limit(20)

    presencasRecentes = presencasData || []
  }

  // Get today's date for quick access
  const hoje = new Date().toISOString().split("T")[0]

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

  // Group recent attendance by date and modalidade
  const presencasPorData = presencasRecentes.reduce(
    (acc, presenca) => {
      const key = `${presenca.data_aula}-${presenca.modalidade_id}`
      if (!acc[key]) {
        acc[key] = {
          data: presenca.data_aula,
          modalidade: presenca.modalidades,
          presencas: [],
        }
      }
      acc[key].presencas.push(presenca)
      return acc
    },
    {} as Record<string, any>,
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Controle de Presença</h1>
              <p className="text-gray-600">Gerencie a frequência dos seus alunos</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/professor">Voltar</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Fazer Chamada Hoje</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modalidades?.map((modalidade) => (
              <Card key={modalidade.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {modalidadeLabels[modalidade.nome as keyof typeof modalidadeLabels]}
                  </CardTitle>
                  <CardDescription>
                    {modalidade.horario_inicio} - {modalidade.horario_fim}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      {modalidade.vagas_ocupadas} alunos
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {modalidade.dias_semana?.join(", ")}
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/professor/modalidades/${modalidade.id}/chamada?data=${hoje}`}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Fazer Chamada
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Attendance Records */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Chamadas Recentes</h2>
          <div className="space-y-4">
            {Object.values(presencasPorData).map((grupo: any) => {
              const totalAlunos = grupo.presencas.length
              const alunosPresentes = grupo.presencas.filter((p: any) => p.presente).length
              const percentualPresenca = totalAlunos > 0 ? Math.round((alunosPresentes / totalAlunos) * 100) : 0

              return (
                <Card key={`${grupo.data}-${grupo.modalidade?.nome}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {modalidadeLabels[grupo.modalidade?.nome as keyof typeof modalidadeLabels]}
                        </CardTitle>
                        <CardDescription>
                          {new Date(grupo.data).toLocaleDateString("pt-BR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            percentualPresenca >= 80
                              ? "default"
                              : percentualPresenca >= 60
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {percentualPresenca}%
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {alunosPresentes}/{totalAlunos} presentes
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 flex-wrap">
                        {grupo.presencas.slice(0, 5).map((presenca: any) => (
                          <Badge
                            key={presenca.id}
                            variant={presenca.presente ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {presenca.profiles?.nome_completo?.split(" ")[0]}
                            {presenca.presente ? " ✓" : " ✗"}
                          </Badge>
                        ))}
                        {grupo.presencas.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{grupo.presencas.length - 5} mais
                          </Badge>
                        )}
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/dashboard/professor/modalidades/${grupo.modalidade?.id}/chamada?data=${grupo.data}`}
                        >
                          Editar
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {Object.keys(presencasPorData).length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Nenhuma chamada registrada ainda.</p>
              <Button asChild>
                <Link href="/dashboard/professor">Fazer Primeira Chamada</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

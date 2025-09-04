import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, TrendingUp, Clock, Award } from "lucide-react"

export default async function AlunoFrequenciaPage() {
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

  // Get student's active inscriptions with modalidade details
  const { data: inscricoes } = await supabase
    .from("inscricoes")
    .select(`
      *,
      modalidades (
        id,
        nome,
        horario_inicio,
        horario_fim,
        dias_semana
      )
    `)
    .eq("aluno_id", data.user.id)
    .eq("status", "ativo")

  // Get attendance records for each modalidade
  const modalidadeIds = inscricoes?.map((i) => i.modalidade_id) || []

  let presencas: any[] = []
  if (modalidadeIds.length > 0) {
    const { data: presencasData } = await supabase
      .from("presencas")
      .select(`
        *,
        modalidades (
          nome
        )
      `)
      .eq("aluno_id", data.user.id)
      .in("modalidade_id", modalidadeIds)
      .order("data_aula", { ascending: false })
      .limit(50)

    presencas = presencasData || []
  }

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

  // Calculate statistics for each modalidade
  const estatisticasPorModalidade =
    inscricoes?.map((inscricao) => {
      const presencasModalidade = presencas.filter((p) => p.modalidade_id === inscricao.modalidade_id)
      const totalAulas = presencasModalidade.length
      const aulasPresentes = presencasModalidade.filter((p) => p.presente).length
      const percentualFrequencia = totalAulas > 0 ? Math.round((aulasPresentes / totalAulas) * 100) : 0

      return {
        ...inscricao,
        totalAulas,
        aulasPresentes,
        percentualFrequencia,
        ultimasPresencas: presencasModalidade.slice(0, 5),
      }
    }) || []

  // Overall statistics
  const totalAulasGeral = presencas.length
  const totalPresentesGeral = presencas.filter((p) => p.presente).length
  const percentualGeralFrequencia = totalAulasGeral > 0 ? Math.round((totalPresentesGeral / totalAulasGeral) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Minha Frequência</h1>
              <p className="text-gray-600">Acompanhe sua presença nas atividades</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/aluno">Voltar</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Overall Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Frequência Geral</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{percentualGeralFrequencia}%</div>
              <p className="text-xs text-muted-foreground">
                {totalPresentesGeral}/{totalAulasGeral} aulas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Aulas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAulasGeral}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aulas Presentes</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPresentesGeral}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividades</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inscricoes?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Frequency by Modalidade */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Frequência por Atividade</h2>

          {estatisticasPorModalidade.map((estatistica) => (
            <Card key={estatistica.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {modalidadeLabels[estatistica.modalidades?.nome as keyof typeof modalidadeLabels]}
                    </CardTitle>
                    <CardDescription>
                      {estatistica.modalidades?.horario_inicio} - {estatistica.modalidades?.horario_fim} •{" "}
                      {estatistica.modalidades?.dias_semana?.join(", ")}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      estatistica.percentualFrequencia >= 80
                        ? "default"
                        : estatistica.percentualFrequencia >= 60
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {estatistica.percentualFrequencia}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Aulas frequentadas: {estatistica.aulasPresentes}</span>
                    <span>Total de aulas: {estatistica.totalAulas}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        estatistica.percentualFrequencia >= 80
                          ? "bg-green-500"
                          : estatistica.percentualFrequencia >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${estatistica.percentualFrequencia}%` }}
                    />
                  </div>

                  {/* Recent attendance */}
                  {estatistica.ultimasPresencas.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Últimas aulas:</h4>
                      <div className="flex gap-2 flex-wrap">
                        {estatistica.ultimasPresencas.map((presenca: any) => (
                          <Badge
                            key={presenca.id}
                            variant={presenca.presente ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {new Date(presenca.data_aula).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                            {presenca.presente ? " ✓" : " ✗"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {estatisticasPorModalidade.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nenhum registro de frequência encontrado.</p>
            <p className="text-sm text-gray-400">Inscreva-se em atividades para começar a acompanhar sua frequência.</p>
          </div>
        )}
      </div>
    </div>
  )
}

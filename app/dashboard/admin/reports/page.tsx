import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BarChart3, Download, Calendar, TrendingUp } from "lucide-react"

export default async function AdminReportsPage() {
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

  // Get attendance statistics by modalidade
  const { data: modalidades } = await supabase
    .from("modalidades")
    .select(`
      *,
      profiles!modalidades_professor_id_fkey (
        nome_completo
      )
    `)
    .eq("ativo", true)
    .order("unidade")
    .order("nome")

  // Get attendance data for each modalidade
  const modalidadesComEstatisticas = await Promise.all(
    modalidades?.map(async (modalidade) => {
      const { data: presencas } = await supabase
        .from("presencas")
        .select("*")
        .eq("modalidade_id", modalidade.id)
        .gte("data_aula", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]) // Last 30 days

      const totalRegistros = presencas?.length || 0
      const totalPresentes = presencas?.filter((p) => p.presente).length || 0
      const percentualFrequencia = totalRegistros > 0 ? Math.round((totalPresentes / totalRegistros) * 100) : 0

      // Get unique students count
      const alunosUnicos = new Set(presencas?.map((p) => p.aluno_id)).size

      return {
        ...modalidade,
        totalRegistros,
        totalPresentes,
        percentualFrequencia,
        alunosUnicos,
      }
    }) || [],
  )

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

  const unidadeLabels = {
    carmem_cristina: "Carmem Cristina - Hortolândia",
    sao_clemente: "São Clemente - Monte Mor",
    nova_hortolandia: "Nova Hortolândia - Hortolândia",
    jardim_paulista: "Jardim Paulista - Monte Mor",
    nawampity_uganda: "Nawampity - Uganda",
  }

  // Group by unit
  const modalidadesPorUnidade = modalidadesComEstatisticas.reduce(
    (acc, modalidade) => {
      if (!acc[modalidade.unidade]) {
        acc[modalidade.unidade] = []
      }
      acc[modalidade.unidade].push(modalidade)
      return acc
    },
    {} as Record<string, typeof modalidadesComEstatisticas>,
  )

  // Overall statistics
  const totalRegistrosGeral = modalidadesComEstatisticas.reduce((sum, m) => sum + m.totalRegistros, 0)
  const totalPresentesGeral = modalidadesComEstatisticas.reduce((sum, m) => sum + m.totalPresentes, 0)
  const percentualGeralFrequencia =
    totalRegistrosGeral > 0 ? Math.round((totalPresentesGeral / totalRegistrosGeral) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Relatórios de Frequência</h1>
              <p className="text-gray-600">Análise de presença dos últimos 30 dias</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/admin">Voltar</Link>
              </Button>
            </div>
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
                {totalPresentesGeral}/{totalRegistrosGeral} presenças
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modalidades Ativas</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modalidadesComEstatisticas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Aulas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRegistrosGeral}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Presenças Registradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPresentesGeral}</div>
            </CardContent>
          </Card>
        </div>

        {/* Reports by Unit */}
        {Object.entries(modalidadesPorUnidade).map(([unidade, modalidadesUnidade]) => (
          <div key={unidade} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {unidadeLabels[unidade as keyof typeof unidadeLabels]}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modalidadesUnidade.map((modalidade) => (
                <Card key={modalidade.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">
                        {modalidadeLabels[modalidade.nome as keyof typeof modalidadeLabels]}
                      </CardTitle>
                      <Badge
                        variant={
                          modalidade.percentualFrequencia >= 80
                            ? "default"
                            : modalidade.percentualFrequencia >= 60
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {modalidade.percentualFrequencia}%
                      </Badge>
                    </div>
                    <CardDescription>
                      Professor: {modalidade.profiles?.nome_completo || "Não atribuído"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Alunos ativos:</span>
                        <span>{modalidade.alunosUnicos}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total de aulas:</span>
                        <span>{modalidade.totalRegistros}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Presenças:</span>
                        <span>{modalidade.totalPresentes}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className={`h-2 rounded-full ${
                            modalidade.percentualFrequencia >= 80
                              ? "bg-green-500"
                              : modalidade.percentualFrequencia >= 60
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${modalidade.percentualFrequencia}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {modalidadesComEstatisticas.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhum dado de frequência disponível.</p>
            <p className="text-sm text-gray-400">Os relatórios aparecerão quando houver registros de presença.</p>
          </div>
        )}
      </div>
    </div>
  )
}

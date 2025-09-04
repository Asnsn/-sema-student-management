import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Clock, Users, Calendar, User, Phone } from "lucide-react"

interface AtividadeDetalhesPageProps {
  params: Promise<{ id: string }>
}

export default async function AtividadeDetalhesPage({ params }: AtividadeDetalhesPageProps) {
  const { id } = await params
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

  // Get modalidade details with professor info
  const { data: modalidade } = await supabase
    .from("modalidades")
    .select(`
      *,
      profiles!modalidades_professor_id_fkey (
        nome_completo,
        telefone
      )
    `)
    .eq("id", id)
    .single()

  if (!modalidade) {
    redirect("/dashboard/aluno")
  }

  // Get student's inscription for this modalidade
  const { data: inscricao } = await supabase
    .from("inscricoes")
    .select("*")
    .eq("aluno_id", data.user.id)
    .eq("modalidade_id", id)
    .single()

  // Get recent attendance for this student in this modalidade
  const { data: presencasRecentes } = await supabase
    .from("presencas")
    .select("*")
    .eq("aluno_id", data.user.id)
    .eq("modalidade_id", id)
    .order("data_aula", { ascending: false })
    .limit(10)

  // Calculate attendance statistics
  const totalAulas = presencasRecentes?.length || 0
  const aulasPresentes = presencasRecentes?.filter((p) => p.presente).length || 0
  const percentualFrequencia = totalAulas > 0 ? Math.round((aulasPresentes / totalAulas) * 100) : 0

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge variant="default">Ativo</Badge>
      case "fila_espera":
        return <Badge variant="secondary">Fila de Espera</Badge>
      case "inativo":
        return <Badge variant="outline">Inativo</Badge>
      default:
        return <Badge variant="outline">Não inscrito</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/aluno">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {modalidadeLabels[modalidade.nome as keyof typeof modalidadeLabels]}
              </h1>
              <p className="text-gray-600">Detalhes da atividade</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Info */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">Informações da Atividade</CardTitle>
                    <CardDescription>{modalidade.descricao}</CardDescription>
                  </div>
                  {inscricao && getStatusBadge(inscricao.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {modalidade.horario_inicio && modalidade.horario_fim && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Horário</p>
                        <p className="text-sm">
                          {modalidade.horario_inicio} - {modalidade.horario_fim}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Vagas</p>
                      <p className="text-sm">
                        {modalidade.vagas_ocupadas}/{modalidade.vagas_maximas} ocupadas
                      </p>
                    </div>
                  </div>

                  {modalidade.dias_semana && modalidade.dias_semana.length > 0 && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Dias da Semana</p>
                        <p className="text-sm">{modalidade.dias_semana.join(", ")}</p>
                      </div>
                    </div>
                  )}

                  {modalidade.profiles && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Professor</p>
                        <p className="text-sm">{modalidade.profiles.nome_completo}</p>
                        {modalidade.profiles.telefone && (
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            <p className="text-xs">{modalidade.profiles.telefone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {inscricao?.observacoes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-900">Suas observações:</p>
                    <p className="text-sm text-gray-600 mt-1">{inscricao.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attendance History */}
            {inscricao && inscricao.status === "ativo" && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Presença</CardTitle>
                  <CardDescription>Suas últimas 10 aulas</CardDescription>
                </CardHeader>
                <CardContent>
                  {presencasRecentes && presencasRecentes.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <span className="font-medium">Frequência Geral</span>
                        <Badge
                          variant={
                            percentualFrequencia >= 80
                              ? "default"
                              : percentualFrequencia >= 60
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {percentualFrequencia}% ({aulasPresentes}/{totalAulas})
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {presencasRecentes.map((presenca) => (
                          <div key={presenca.id} className="flex justify-between items-center p-2 border rounded-md">
                            <span className="text-sm">
                              {new Date(presenca.data_aula).toLocaleDateString("pt-BR", {
                                weekday: "short",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                            <Badge variant={presenca.presente ? "default" : "secondary"}>
                              {presenca.presente ? "Presente" : "Ausente"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nenhum registro de presença ainda.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Inscription Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status da Inscrição</CardTitle>
              </CardHeader>
              <CardContent>
                {inscricao ? (
                  <div className="space-y-3">
                    {getStatusBadge(inscricao.status)}
                    <p className="text-sm text-gray-600">
                      Inscrito em: {new Date(inscricao.data_inscricao).toLocaleDateString("pt-BR")}
                    </p>
                    {inscricao.status === "fila_espera" && (
                      <p className="text-sm text-amber-600">
                        Você está na fila de espera. Aguarde a aprovação do professor.
                      </p>
                    )}
                    {inscricao.data_aprovacao && (
                      <p className="text-sm text-green-600">
                        Aprovado em: {new Date(inscricao.data_aprovacao).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Você não está inscrito nesta atividade.</p>
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/aluno/inscricoes/nova?modalidade=${modalidade.id}`}>Inscrever-se</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/dashboard/aluno/frequencia">Ver Todas as Frequências</Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/dashboard/aluno/modalidades">Explorar Outras Atividades</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Clock, Users, Award } from "lucide-react"

export default async function AlunoDashboardPage() {
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

  // Get student's inscriptions with modalidade details
  const { data: inscricoes } = await supabase
    .from("inscricoes")
    .select(`
      *,
      modalidades (
        id,
        nome,
        descricao,
        horario_inicio,
        horario_fim,
        dias_semana,
        vagas_maximas,
        vagas_ocupadas
      )
    `)
    .eq("aluno_id", data.user.id)

  // Get available modalidades for the student's unit
  const { data: modalidadesDisponiveis } = await supabase
    .from("modalidades")
    .select("*")
    .eq("unidade", profile.unidade)
    .eq("ativo", true)

  // Filter modalidades not yet enrolled
  const modalidadesNaoInscritas =
    modalidadesDisponiveis?.filter(
      (modalidade) => !inscricoes?.some((inscricao) => inscricao.modalidade_id === modalidade.id),
    ) || []

  const inscricoesAtivas = inscricoes?.filter((i) => i.status === "ativo") || []
  const inscricoesPendentes = inscricoes?.filter((i) => i.status === "fila_espera") || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portal do Aluno</h1>
              <p className="text-gray-600">Bem-vindo, {profile.nome_completo}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/dashboard/profile">Meu Perfil</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/login">Sair</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividades Ativas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inscricoesAtivas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Na Fila de Espera</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inscricoesPendentes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modalidadesNaoInscritas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Frequência Média</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
            </CardContent>
          </Card>
        </div>

        {/* Minhas Atividades */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Minhas Atividades</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inscricoesAtivas.map((inscricao) => (
              <Card key={inscricao.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="capitalize">{inscricao.modalidades?.nome.replace(/_/g, " ")}</CardTitle>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                  <CardDescription>
                    {inscricao.modalidades?.horario_inicio} - {inscricao.modalidades?.horario_fim}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Dias: {inscricao.modalidades?.dias_semana?.join(", ")}</p>
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/dashboard/aluno/atividades/${inscricao.modalidade_id}`}>Ver Detalhes</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {inscricoesPendentes.map((inscricao) => (
              <Card key={inscricao.id} className="border-yellow-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="capitalize">{inscricao.modalidades?.nome.replace(/_/g, " ")}</CardTitle>
                    <Badge variant="secondary">Fila de Espera</Badge>
                  </div>
                  <CardDescription>Aguardando aprovação do professor</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Inscrito em: {new Date(inscricao.data_inscricao).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Atividades Disponíveis */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Atividades Disponíveis</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modalidadesNaoInscritas.slice(0, 6).map((modalidade) => (
              <Card key={modalidade.id}>
                <CardHeader>
                  <CardTitle className="capitalize">{modalidade.nome.replace(/_/g, " ")}</CardTitle>
                  <CardDescription>
                    {modalidade.horario_inicio} - {modalidade.horario_fim}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Vagas: {modalidade.vagas_ocupadas}/{modalidade.vagas_maximas}
                    </p>
                    <p className="text-sm text-gray-600">Dias: {modalidade.dias_semana?.join(", ")}</p>
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/dashboard/aluno/inscricoes/nova?modalidade=${modalidade.id}`}>Inscrever-se</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {modalidadesNaoInscritas.length > 6 && (
            <div className="text-center mt-4">
              <Button asChild variant="outline">
                <Link href="/dashboard/aluno/modalidades">Ver Todas as Atividades</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Minha Frequência</CardTitle>
              <CardDescription>Visualizar histórico de presença nas atividades</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard/aluno/frequencia">Ver Frequência</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Novas Inscrições</CardTitle>
              <CardDescription>Inscrever-se em novas modalidades e atividades</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard/aluno/modalidades">Explorar Atividades</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meu Perfil</CardTitle>
              <CardDescription>Atualizar informações pessoais e de contato</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard/profile">Editar Perfil</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

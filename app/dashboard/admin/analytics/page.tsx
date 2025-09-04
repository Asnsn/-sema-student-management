import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, Calendar, TrendingUp, MapPin, Clock } from "lucide-react"

export default async function AnalyticsPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") redirect("/dashboard")

  // Buscar estatísticas gerais
  const { data: totalUsuarios } = await supabase.from("profiles").select("id", { count: "exact" })

  const { data: totalAlunos } = await supabase.from("profiles").select("id", { count: "exact" }).eq("role", "aluno")

  const { data: totalProfessores } = await supabase
    .from("profiles")
    .select("id", { count: "exact" })
    .eq("role", "professor")

  const { data: totalModalidades } = await supabase.from("modalidades").select("id", { count: "exact" })

  const { data: inscricoesAtivas } = await supabase
    .from("inscricoes")
    .select("id", { count: "exact" })
    .eq("status", "aprovada")

  // Estatísticas por unidade
  const { data: estatisticasUnidade } = await supabase.from("profiles").select("unidade").eq("role", "aluno")

  const unidadeStats = estatisticasUnidade?.reduce(
    (acc, curr) => {
      acc[curr.unidade] = (acc[curr.unidade] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Modalidades mais populares
  const { data: modalidadesPopulares } = await supabase
    .from("inscricoes")
    .select(`
      modalidade_id,
      modalidades(nome)
    `)
    .eq("status", "aprovada")

  const modalidadeStats = modalidadesPopulares?.reduce(
    (acc, curr) => {
      const nome = curr.modalidades?.nome
      if (nome) {
        acc[nome] = (acc[nome] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const topModalidades = Object.entries(modalidadeStats || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Relatórios</h1>
        <p className="text-muted-foreground">Visão geral das estatísticas do Instituto SEMA</p>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsuarios?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Todos os usuários cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlunos?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Alunos cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProfessores?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Professores ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modalidades</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalModalidades?.count || 0}</div>
            <p className="text-xs text-muted-foreground">Atividades disponíveis</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estatísticas por unidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Alunos por Unidade
            </CardTitle>
            <CardDescription>Distribuição de alunos nas unidades SEMA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(unidadeStats || {}).map(([unidade, count]) => (
                <div key={unidade} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    <span className="text-sm font-medium">
                      {unidade === "carmem-cristina" && "Carmem Cristina"}
                      {unidade === "sao-clemente" && "São Clemente"}
                      {unidade === "nova-hortolandia" && "Nova Hortolândia"}
                      {unidade === "jardim-paulista" && "Jardim Paulista"}
                      {unidade === "nawampity" && "Nawampity"}
                    </span>
                  </div>
                  <Badge variant="secondary">{count} alunos</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modalidades mais populares */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Modalidades Populares
            </CardTitle>
            <CardDescription>Top 5 modalidades com mais inscrições</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topModalidades.map(([modalidade, count], index) => (
                <div key={modalidade} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{modalidade}</span>
                  </div>
                  <Badge variant="outline">{count} inscrições</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de inscrições */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Resumo de Inscrições
          </CardTitle>
          <CardDescription>Status atual das inscrições no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{inscricoesAtivas?.count || 0}</div>
              <p className="text-sm text-green-700">Inscrições Aprovadas</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">0</div>
              <p className="text-sm text-yellow-700">Aguardando Aprovação</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <p className="text-sm text-blue-700">Em Fila de Espera</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

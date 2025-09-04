import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Calendar, CheckCircle, Clock } from "lucide-react"

export default async function ProfessorDashboardPage() {
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

  // Get statistics for professor's classes
  const modalidadeIds = modalidades?.map((m) => m.id) || []

  let totalAlunos = 0
  let inscricoesPendentes = 0

  if (modalidadeIds.length > 0) {
    const [{ count: alunosCount }, { count: pendentesCount }] = await Promise.all([
      supabase
        .from("inscricoes")
        .select("*", { count: "exact", head: true })
        .in("modalidade_id", modalidadeIds)
        .eq("status", "ativo"),
      supabase
        .from("inscricoes")
        .select("*", { count: "exact", head: true })
        .in("modalidade_id", modalidadeIds)
        .eq("status", "fila_espera"),
    ])

    totalAlunos = alunosCount || 0
    inscricoesPendentes = pendentesCount || 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard do Professor</h1>
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
              <CardTitle className="text-sm font-medium">Minhas Modalidades</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modalidades?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAlunos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inscrições Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inscricoesPendentes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chamadas Hoje</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Modalidades do Professor */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Minhas Modalidades</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modalidades?.map((modalidade) => (
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
                    <div className="flex gap-2">
                      <Button asChild size="sm" className="flex-1">
                        <Link href={`/dashboard/professor/modalidades/${modalidade.id}/chamada`}>Chamada</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1 bg-transparent">
                        <Link href={`/dashboard/professor/modalidades/${modalidade.id}/alunos`}>Alunos</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Presença</CardTitle>
              <CardDescription>Fazer chamada e controlar frequência dos alunos</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard/professor/presenca">Fazer Chamada</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Alunos</CardTitle>
              <CardDescription>Visualizar e gerenciar alunos das suas modalidades</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard/professor/alunos">Ver Alunos</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inscrições</CardTitle>
              <CardDescription>Aprovar ou rejeitar inscrições pendentes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard/professor/inscricoes">Gerenciar Inscrições</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

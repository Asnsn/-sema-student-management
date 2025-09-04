import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Edit, Users, Clock } from "lucide-react"

export default async function AdminModalidadesPage() {
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

  // Get all modalidades with professor info
  const { data: modalidades } = await supabase
    .from("modalidades")
    .select(`
      *,
      profiles!modalidades_professor_id_fkey (
        nome_completo
      )
    `)
    .order("unidade", { ascending: true })
    .order("nome", { ascending: true })

  const unidadeLabels = {
    carmem_cristina: "Carmem Cristina - Hortolândia",
    sao_clemente: "São Clemente - Monte Mor",
    nova_hortolandia: "Nova Hortolândia - Hortolândia",
    jardim_paulista: "Jardim Paulista - Monte Mor",
    nawampity_uganda: "Nawampity - Uganda",
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

  // Group modalidades by unit
  const modalidadesPorUnidade =
    modalidades?.reduce(
      (acc, modalidade) => {
        if (!acc[modalidade.unidade]) {
          acc[modalidade.unidade] = []
        }
        acc[modalidade.unidade].push(modalidade)
        return acc
      },
      {} as Record<string, typeof modalidades>,
    ) || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Modalidades</h1>
              <p className="text-gray-600">Administrar atividades e esportes</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/dashboard/admin/modalidades/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Modalidade
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard/admin">Voltar</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
                      <Badge variant={modalidade.ativo ? "default" : "secondary"}>
                        {modalidade.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <CardDescription>{modalidade.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {modalidade.horario_inicio} - {modalidade.horario_fim}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {modalidade.vagas_ocupadas}/{modalidade.vagas_maximas} vagas
                      </div>

                      <div className="text-sm text-gray-600">
                        <strong>Dias:</strong> {modalidade.dias_semana?.join(", ")}
                      </div>

                      <div className="text-sm text-gray-600">
                        <strong>Professor:</strong> {modalidade.profiles?.nome_completo || "Não atribuído"}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button asChild size="sm" className="flex-1">
                          <Link href={`/dashboard/admin/modalidades/${modalidade.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Link href={`/dashboard/admin/modalidades/${modalidade.id}/alunos`}>
                            <Users className="h-4 w-4 mr-1" />
                            Alunos
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {modalidades?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhuma modalidade cadastrada ainda.</p>
            <Button asChild>
              <Link href="/dashboard/admin/modalidades/new">Criar Primeira Modalidade</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

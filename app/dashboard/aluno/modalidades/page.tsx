import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Clock, Users, MapPin } from "lucide-react"

export default async function AlunoModalidadesPage() {
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

  // Get available modalidades for student's unit
  const { data: modalidades } = await supabase
    .from("modalidades")
    .select("*")
    .eq("unidade", profile.unidade)
    .eq("ativo", true)
    .order("nome")

  // Get student's current inscriptions
  const { data: inscricoes } = await supabase
    .from("inscricoes")
    .select("modalidade_id, status")
    .eq("aluno_id", data.user.id)

  const inscricoesMap =
    inscricoes?.reduce(
      (acc, inscricao) => {
        acc[inscricao.modalidade_id] = inscricao.status
        return acc
      },
      {} as Record<string, string>,
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

  const getStatusBadge = (modalidadeId: string, vagas_ocupadas: number, vagas_maximas: number) => {
    const status = inscricoesMap[modalidadeId]

    if (status === "ativo") {
      return <Badge variant="default">Inscrito</Badge>
    }
    if (status === "fila_espera") {
      return <Badge variant="secondary">Fila de Espera</Badge>
    }
    if (vagas_ocupadas >= vagas_maximas) {
      return <Badge variant="destructive">Lotado</Badge>
    }
    return <Badge variant="outline">Disponível</Badge>
  }

  const canEnroll = (modalidadeId: string, vagas_ocupadas: number, vagas_maximas: number) => {
    const status = inscricoesMap[modalidadeId]
    return !status // Can enroll if not already enrolled
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Atividades Disponíveis</h1>
              <p className="text-gray-600">Explore e inscreva-se em novas modalidades</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/aluno">Voltar</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modalidades?.map((modalidade) => (
            <Card key={modalidade.id} className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {modalidadeLabels[modalidade.nome as keyof typeof modalidadeLabels]}
                  </CardTitle>
                  {getStatusBadge(modalidade.id, modalidade.vagas_ocupadas, modalidade.vagas_maximas)}
                </div>
                <CardDescription>{modalidade.descricao}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {modalidade.horario_inicio && modalidade.horario_fim && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {modalidade.horario_inicio} - {modalidade.horario_fim}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    {modalidade.vagas_ocupadas}/{modalidade.vagas_maximas} vagas ocupadas
                  </div>

                  {modalidade.dias_semana && modalidade.dias_semana.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <strong>Dias:</strong> {modalidade.dias_semana.join(", ")}
                    </div>
                  )}

                  <div className="pt-3">
                    {canEnroll(modalidade.id, modalidade.vagas_ocupadas, modalidade.vagas_maximas) ? (
                      <Button asChild className="w-full">
                        <Link href={`/dashboard/aluno/inscricoes/nova?modalidade=${modalidade.id}`}>Inscrever-se</Link>
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        {inscricoesMap[modalidade.id] === "ativo"
                          ? "Já Inscrito"
                          : inscricoesMap[modalidade.id] === "fila_espera"
                            ? "Na Fila de Espera"
                            : "Indisponível"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {modalidades?.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Nenhuma modalidade disponível na sua unidade.</p>
            <p className="text-sm text-gray-400">Entre em contato com a administração para mais informações.</p>
          </div>
        )}
      </div>
    </div>
  )
}

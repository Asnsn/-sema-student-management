import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { User, Calendar, CheckCircle } from "lucide-react"
import { AprovarInscricaoButton } from "@/components/aprovar-inscricao-button"

export default async function ProfessorInscricoesPage() {
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
    .select("id, nome")
    .eq("professor_id", data.user.id)
    .eq("ativo", true)

  const modalidadeIds = modalidades?.map((m) => m.id) || []

  // Get pending inscriptions for professor's modalidades
  const { data: inscricoesPendentes } = await supabase
    .from("inscricoes")
    .select(`
      *,
      profiles!inscricoes_aluno_id_fkey (
        nome_completo,
        telefone,
        data_nascimento,
        responsavel_nome,
        responsavel_telefone
      ),
      modalidades (
        nome,
        vagas_maximas,
        vagas_ocupadas
      )
    `)
    .in("modalidade_id", modalidadeIds)
    .eq("status", "fila_espera")
    .order("data_inscricao")

  // Get recent approved inscriptions
  const { data: inscricoesRecentes } = await supabase
    .from("inscricoes")
    .select(`
      *,
      profiles!inscricoes_aluno_id_fkey (
        nome_completo
      ),
      modalidades (
        nome
      )
    `)
    .in("modalidade_id", modalidadeIds)
    .eq("status", "ativo")
    .order("data_aprovacao", { ascending: false })
    .limit(10)

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Inscrições</h1>
              <p className="text-gray-600">Aprovar ou rejeitar inscrições pendentes</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/dashboard/professor">Voltar</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Pending Inscriptions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Inscrições Pendentes ({inscricoesPendentes?.length || 0})
          </h2>

          {inscricoesPendentes && inscricoesPendentes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inscricoesPendentes.map((inscricao) => (
                <Card key={inscricao.id} className="border-yellow-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{inscricao.profiles?.nome_completo}</CardTitle>
                      <Badge variant="secondary">Pendente</Badge>
                    </div>
                    <CardDescription>
                      {modalidadeLabels[inscricao.modalidades?.nome as keyof typeof modalidadeLabels]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <strong>Inscrito em:</strong> {new Date(inscricao.data_inscricao).toLocaleDateString("pt-BR")}
                      </div>

                      {inscricao.profiles?.data_nascimento && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {calculateAge(inscricao.profiles.data_nascimento)} anos
                        </div>
                      )}

                      {inscricao.profiles?.telefone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-4 w-4" />
                          {inscricao.profiles.telefone}
                        </div>
                      )}

                      {inscricao.profiles?.responsavel_nome && (
                        <div className="text-sm text-gray-600">
                          <strong>Responsável:</strong> {inscricao.profiles.responsavel_nome}
                          {inscricao.profiles.responsavel_telefone && (
                            <div className="text-xs mt-1">{inscricao.profiles.responsavel_telefone}</div>
                          )}
                        </div>
                      )}

                      {inscricao.observacoes && (
                        <div className="text-sm text-gray-600">
                          <strong>Observações:</strong> {inscricao.observacoes}
                        </div>
                      )}

                      <div className="text-sm text-gray-600">
                        <strong>Vagas:</strong> {inscricao.modalidades?.vagas_ocupadas}/
                        {inscricao.modalidades?.vagas_maximas}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <AprovarInscricaoButton
                          inscricaoId={inscricao.id}
                          modalidadeId={inscricao.modalidade_id}
                          action="aprovar"
                        />
                        <AprovarInscricaoButton
                          inscricaoId={inscricao.id}
                          modalidadeId={inscricao.modalidade_id}
                          action="rejeitar"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma inscrição pendente no momento.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Approved Inscriptions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Inscrições Recentes</h2>

          {inscricoesRecentes && inscricoesRecentes.length > 0 ? (
            <div className="space-y-3">
              {inscricoesRecentes.map((inscricao) => (
                <Card key={inscricao.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{inscricao.profiles?.nome_completo}</p>
                        <p className="text-sm text-gray-600">
                          {modalidadeLabels[inscricao.modalidades?.nome as keyof typeof modalidadeLabels]}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">Aprovado</Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {inscricao.data_aprovacao && new Date(inscricao.data_aprovacao).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Nenhuma inscrição aprovada recentemente.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

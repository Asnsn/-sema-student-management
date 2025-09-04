"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Calendar, AlertCircle } from "lucide-react"

interface Modalidade {
  id: string
  nome: string
  descricao?: string
  horario_inicio?: string
  horario_fim?: string
  dias_semana?: string[]
  vagas_maximas: number
  vagas_ocupadas: number
}

interface InscricaoFormProps {
  modalidadeSelecionada?: Modalidade | null
  modalidadesDisponiveis: Modalidade[]
  alunoId: string
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

export function InscricaoForm({ modalidadeSelecionada, modalidadesDisponiveis, alunoId }: InscricaoFormProps) {
  const [modalidadeId, setModalidadeId] = useState(modalidadeSelecionada?.id || "")
  const [observacoes, setObservacoes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null)
  const router = useRouter()

  const modalidadeSelecionadaAtual = modalidadesDisponiveis.find((m) => m.id === modalidadeId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    if (!modalidadeId) {
      setMessage({ type: "error", text: "Selecione uma modalidade" })
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      const modalidade = modalidadesDisponiveis.find((m) => m.id === modalidadeId)
      if (!modalidade) {
        throw new Error("Modalidade não encontrada")
      }

      // Determine status based on available spots
      const status = modalidade.vagas_ocupadas < modalidade.vagas_maximas ? "ativo" : "fila_espera"

      const inscricaoData = {
        aluno_id: alunoId,
        modalidade_id: modalidadeId,
        status,
        observacoes: observacoes || null,
      }

      const { error } = await supabase.from("inscricoes").insert(inscricaoData)

      if (error) throw error

      // Update modalidade vagas count if approved directly
      if (status === "ativo") {
        await supabase
          .from("modalidades")
          .update({ vagas_ocupadas: modalidade.vagas_ocupadas + 1 })
          .eq("id", modalidadeId)
      }

      if (status === "ativo") {
        setMessage({ type: "success", text: "Inscrição realizada com sucesso! Você foi aprovado automaticamente." })
      } else {
        setMessage({
          type: "warning",
          text: "Inscrição realizada! Você foi adicionado à fila de espera. Aguarde a aprovação do professor.",
        })
      }

      setTimeout(() => {
        router.push("/dashboard/aluno")
      }, 2000)
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao realizar inscrição",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusInfo = (modalidade: Modalidade) => {
    const vagasDisponiveis = modalidade.vagas_maximas - modalidade.vagas_ocupadas
    if (vagasDisponiveis > 0) {
      return {
        status: "available",
        text: `${vagasDisponiveis} vagas disponíveis`,
        badge: "default" as const,
      }
    } else {
      return {
        status: "waitlist",
        text: "Fila de espera",
        badge: "secondary" as const,
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Inscrição</CardTitle>
        <CardDescription>Selecione uma atividade e preencha suas informações</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="modalidade">Atividade</Label>
            <Select value={modalidadeId} onValueChange={setModalidadeId} disabled={!!modalidadeSelecionada}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma atividade" />
              </SelectTrigger>
              <SelectContent>
                {modalidadesDisponiveis.map((modalidade) => {
                  const statusInfo = getStatusInfo(modalidade)
                  return (
                    <SelectItem key={modalidade.id} value={modalidade.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{modalidadeLabels[modalidade.nome as keyof typeof modalidadeLabels]}</span>
                        <Badge variant={statusInfo.badge} className="ml-2">
                          {statusInfo.text}
                        </Badge>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {modalidadeSelecionadaAtual && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">
                  {modalidadeLabels[modalidadeSelecionadaAtual.nome as keyof typeof modalidadeLabels]}
                </CardTitle>
                <CardDescription>{modalidadeSelecionadaAtual.descricao}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {modalidadeSelecionadaAtual.horario_inicio && modalidadeSelecionadaAtual.horario_fim && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {modalidadeSelecionadaAtual.horario_inicio} - {modalidadeSelecionadaAtual.horario_fim}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    {modalidadeSelecionadaAtual.vagas_ocupadas}/{modalidadeSelecionadaAtual.vagas_maximas} vagas
                    ocupadas
                  </div>

                  {modalidadeSelecionadaAtual.dias_semana && modalidadeSelecionadaAtual.dias_semana.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {modalidadeSelecionadaAtual.dias_semana.join(", ")}
                    </div>
                  )}

                  {modalidadeSelecionadaAtual.vagas_ocupadas >= modalidadeSelecionadaAtual.vagas_maximas && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                      <AlertCircle className="h-4 w-4" />
                      Esta atividade está lotada. Você será adicionado à fila de espera.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Alguma informação adicional que gostaria de compartilhar..."
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700"
                  : message.type === "warning"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading || !modalidadeId}>
              {isLoading ? "Inscrevendo..." : "Realizar Inscrição"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

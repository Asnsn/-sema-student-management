"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Calendar, Save, Users } from "lucide-react"

interface Aluno {
  id: string
  aluno_id: string
  profiles: {
    id: string
    nome_completo: string
  }
}

interface Modalidade {
  id: string
  nome: string
}

interface PresencaExistente {
  id: string
  aluno_id: string
  presente: boolean
  observacoes?: string
}

interface ChamadaFormProps {
  modalidade: Modalidade
  alunos: Aluno[]
  presencasExistentes: Record<string, PresencaExistente>
  dataAula: string
  professorId: string
}

export function ChamadaForm({ modalidade, alunos, presencasExistentes, dataAula, professorId }: ChamadaFormProps) {
  const [presencas, setPresencas] = useState<Record<string, { presente: boolean; observacoes: string }>>(() => {
    const initial: Record<string, { presente: boolean; observacoes: string }> = {}
    alunos.forEach((aluno) => {
      const existente = presencasExistentes[aluno.profiles.id]
      initial[aluno.profiles.id] = {
        presente: existente?.presente || false,
        observacoes: existente?.observacoes || "",
      }
    })
    return initial
  })

  const [selectedDate, setSelectedDate] = useState(dataAula)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handlePresencaChange = (alunoId: string, presente: boolean) => {
    setPresencas((prev) => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        presente,
      },
    }))
  }

  const handleObservacaoChange = (alunoId: string, observacoes: string) => {
    setPresencas((prev) => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        observacoes,
      },
    }))
  }

  const handleMarcarTodos = (presente: boolean) => {
    const novasPresencas = { ...presencas }
    alunos.forEach((aluno) => {
      novasPresencas[aluno.profiles.id] = {
        ...novasPresencas[aluno.profiles.id],
        presente,
      }
    })
    setPresencas(novasPresencas)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    try {
      // Prepare attendance data
      const presencasData = alunos.map((aluno) => ({
        aluno_id: aluno.profiles.id,
        modalidade_id: modalidade.id,
        data_aula: selectedDate,
        presente: presencas[aluno.profiles.id]?.presente || false,
        observacoes: presencas[aluno.profiles.id]?.observacoes || null,
        registrado_por: professorId,
      }))

      // Delete existing attendance for this date and modalidade
      await supabase.from("presencas").delete().eq("modalidade_id", modalidade.id).eq("data_aula", selectedDate)

      // Insert new attendance records
      const { error } = await supabase.from("presencas").insert(presencasData)

      if (error) throw error

      setMessage({ type: "success", text: "Chamada salva com sucesso!" })

      // Refresh the page to show updated data
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao salvar chamada",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = () => {
    if (selectedDate !== dataAula) {
      router.push(`/dashboard/professor/modalidades/${modalidade.id}/chamada?data=${selectedDate}`)
    }
  }

  const totalPresentes = Object.values(presencas).filter((p) => p.presente).length
  const totalAlunos = alunos.length

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Lista de Chamada
            </CardTitle>
            <CardDescription>Registre a presença dos alunos para esta aula</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {totalPresentes}/{totalAlunos}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="data_aula">Data da Aula</Label>
              <Input
                id="data_aula"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            {selectedDate !== dataAula && (
              <Button type="button" variant="outline" onClick={handleDateChange}>
                Carregar Data
              </Button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => handleMarcarTodos(true)}>
              Marcar Todos Presentes
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => handleMarcarTodos(false)}>
              Marcar Todos Ausentes
            </Button>
          </div>

          {/* Students List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Alunos ({totalAlunos})</h3>
            <div className="space-y-4">
              {alunos.map((aluno) => (
                <Card key={aluno.profiles.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center space-x-2 pt-1">
                      <Checkbox
                        id={`presente-${aluno.profiles.id}`}
                        checked={presencas[aluno.profiles.id]?.presente || false}
                        onCheckedChange={(checked) => handlePresencaChange(aluno.profiles.id, checked as boolean)}
                      />
                      <Label htmlFor={`presente-${aluno.profiles.id}`} className="font-medium">
                        {aluno.profiles.nome_completo}
                      </Label>
                    </div>

                    <div className="flex-1">
                      <Textarea
                        placeholder="Observações (opcional)"
                        value={presencas[aluno.profiles.id]?.observacoes || ""}
                        onChange={(e) => handleObservacaoChange(aluno.profiles.id, e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? "Salvando..." : "Salvar Chamada"}
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

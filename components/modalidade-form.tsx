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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const modalidadeOptions = [
  { value: "kung_fu", label: "Kung Fu" },
  { value: "handebol", label: "Handebol" },
  { value: "futebol_futsal", label: "Futebol/Futsal" },
  { value: "volei", label: "Vôlei" },
  { value: "ballet", label: "Ballet" },
  { value: "jazz", label: "Jazz" },
  { value: "zumba", label: "Zumba" },
  { value: "capoeira", label: "Capoeira" },
  { value: "bateria", label: "Bateria" },
  { value: "croche", label: "Crochê" },
  { value: "reforco_escolar", label: "Reforço Escolar" },
  { value: "ingles", label: "Inglês" },
]

const unidadeOptions = [
  { value: "carmem_cristina", label: "Carmem Cristina - Hortolândia" },
  { value: "sao_clemente", label: "São Clemente - Monte Mor" },
  { value: "nova_hortolandia", label: "Nova Hortolândia - Hortolândia" },
  { value: "jardim_paulista", label: "Jardim Paulista - Monte Mor" },
  { value: "nawampity_uganda", label: "Nawampity - Uganda" },
]

const diasSemanaOptions = [
  { value: "segunda", label: "Segunda-feira" },
  { value: "terca", label: "Terça-feira" },
  { value: "quarta", label: "Quarta-feira" },
  { value: "quinta", label: "Quinta-feira" },
  { value: "sexta", label: "Sexta-feira" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
]

interface Professor {
  id: string
  nome_completo: string
  unidade: string
}

interface Modalidade {
  id?: string
  nome: string
  descricao?: string
  unidade: string
  professor_id?: string
  vagas_maximas: number
  horario_inicio?: string
  horario_fim?: string
  dias_semana?: string[]
  ativo: boolean
}

interface ModalidadeFormProps {
  modalidade?: Modalidade
  professores: Professor[]
}

export function ModalidadeForm({ modalidade, professores }: ModalidadeFormProps) {
  const [formData, setFormData] = useState({
    nome: modalidade?.nome || "kung_fu",
    descricao: modalidade?.descricao || "",
    unidade: modalidade?.unidade || "carmem_cristina",
    professor_id: modalidade?.professor_id || "",
    vagas_maximas: modalidade?.vagas_maximas || 30,
    horario_inicio: modalidade?.horario_inicio || "",
    horario_fim: modalidade?.horario_fim || "",
    dias_semana: modalidade?.dias_semana || [],
    ativo: modalidade?.ativo ?? true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleDiaChange = (dia: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        dias_semana: [...formData.dias_semana, dia],
      })
    } else {
      setFormData({
        ...formData,
        dias_semana: formData.dias_semana.filter((d) => d !== dia),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    try {
      const modalidadeData = {
        nome: formData.nome,
        descricao: formData.descricao,
        unidade: formData.unidade,
        professor_id: formData.professor_id || null,
        vagas_maximas: formData.vagas_maximas,
        horario_inicio: formData.horario_inicio || null,
        horario_fim: formData.horario_fim || null,
        dias_semana: formData.dias_semana,
        ativo: formData.ativo,
        updated_at: new Date().toISOString(),
      }

      if (modalidade?.id) {
        // Update existing modalidade
        const { error } = await supabase.from("modalidades").update(modalidadeData).eq("id", modalidade.id)

        if (error) throw error
        setMessage({ type: "success", text: "Modalidade atualizada com sucesso!" })
      } else {
        // Create new modalidade
        const { error } = await supabase.from("modalidades").insert(modalidadeData)

        if (error) throw error
        setMessage({ type: "success", text: "Modalidade criada com sucesso!" })
      }

      setTimeout(() => {
        router.push("/dashboard/admin/modalidades")
      }, 1500)
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao salvar modalidade",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter professors by selected unit
  const professoresFiltrados = formData.unidade
    ? professores.filter((p) => p.unidade === formData.unidade)
    : professores

  return (
    <Card>
      <CardHeader>
        <CardTitle>{modalidade ? "Editar Modalidade" : "Nova Modalidade"}</CardTitle>
        <CardDescription>
          {modalidade ? "Atualize as informações da modalidade" : "Preencha os dados para criar uma nova modalidade"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Tipo de Modalidade</Label>
              <Select value={formData.nome} onValueChange={(value) => setFormData({ ...formData, nome: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a modalidade" />
                </SelectTrigger>
                <SelectContent>
                  {modalidadeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade</Label>
              <Select
                value={formData.unidade}
                onValueChange={(value) => setFormData({ ...formData, unidade: value, professor_id: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {unidadeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
              placeholder="Descreva a modalidade..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="professor_id">Professor Responsável</Label>
              <Select
                value={formData.professor_id}
                onValueChange={(value) => setFormData({ ...formData, professor_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum professor</SelectItem>
                  {professoresFiltrados.map((professor) => (
                    <SelectItem key={professor.id} value={professor.id}>
                      {professor.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vagas_maximas">Vagas Máximas</Label>
              <Input
                id="vagas_maximas"
                type="number"
                min="1"
                max="100"
                value={formData.vagas_maximas}
                onChange={(e) => setFormData({ ...formData, vagas_maximas: Number.parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horario_inicio">Horário de Início</Label>
              <Input
                id="horario_inicio"
                type="time"
                value={formData.horario_inicio}
                onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario_fim">Horário de Término</Label>
              <Input
                id="horario_fim"
                type="time"
                value={formData.horario_fim}
                onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Dias da Semana</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {diasSemanaOptions.map((dia) => (
                <div key={dia.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={dia.value}
                    checked={formData.dias_semana.includes(dia.value)}
                    onCheckedChange={(checked) => handleDiaChange(dia.value, checked as boolean)}
                  />
                  <Label htmlFor={dia.value} className="text-sm">
                    {dia.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked as boolean })}
            />
            <Label htmlFor="ativo">Modalidade ativa</Label>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : modalidade ? "Atualizar" : "Criar Modalidade"}
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

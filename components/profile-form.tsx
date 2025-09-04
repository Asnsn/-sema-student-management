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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const unidades = [
  { value: "carmem_cristina", label: "Carmem Cristina - Hortolândia" },
  { value: "sao_clemente", label: "São Clemente - Monte Mor" },
  { value: "nova_hortolandia", label: "Nova Hortolândia - Hortolândia" },
  { value: "jardim_paulista", label: "Jardim Paulista - Monte Mor" },
  { value: "nawampity_uganda", label: "Nawampity - Uganda" },
]

interface Profile {
  id: string
  email: string
  nome_completo: string
  role: string
  telefone?: string
  data_nascimento?: string
  endereco?: string
  responsavel_nome?: string
  responsavel_telefone?: string
  unidade: string
}

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    nome_completo: profile.nome_completo || "",
    telefone: profile.telefone || "",
    data_nascimento: profile.data_nascimento || "",
    endereco: profile.endereco || "",
    responsavel_nome: profile.responsavel_nome || "",
    responsavel_telefone: profile.responsavel_telefone || "",
    unidade: profile.unidade || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nome_completo: formData.nome_completo,
          telefone: formData.telefone,
          data_nascimento: formData.data_nascimento || null,
          endereco: formData.endereco,
          responsavel_nome: formData.responsavel_nome,
          responsavel_telefone: formData.responsavel_telefone,
          unidade: formData.unidade,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
      router.refresh()
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao atualizar perfil",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
        <CardDescription>Atualize suas informações de perfil</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome_completo">Nome Completo</Label>
              <Input
                id="nome_completo"
                value={formData.nome_completo}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile.email} disabled className="bg-gray-50" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidade">Unidade</Label>
            <Select value={formData.unidade} onValueChange={(value) => setFormData({ ...formData, unidade: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unidades.map((unidade) => (
                  <SelectItem key={unidade.value} value={unidade.value}>
                    {unidade.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {profile.role === "aluno" && (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsavel_nome">Nome do Responsável</Label>
                  <Input
                    id="responsavel_nome"
                    value={formData.responsavel_nome}
                    onChange={(e) => setFormData({ ...formData, responsavel_nome: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel_telefone">Telefone do Responsável</Label>
                  <Input
                    id="responsavel_telefone"
                    type="tel"
                    value={formData.responsavel_telefone}
                    onChange={(e) => setFormData({ ...formData, responsavel_telefone: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

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
              {isLoading ? "Salvando..." : "Salvar Alterações"}
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

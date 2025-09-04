import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Bell, Shield, Database } from "lucide-react"

export default async function ConfiguracoesPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") redirect("/dashboard")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
        <p className="text-muted-foreground">Gerencie as configurações gerais do Instituto SEMA</p>
      </div>

      <div className="grid gap-6">
        {/* Configurações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>Configurações básicas do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome-sistema">Nome do Sistema</Label>
                <Input id="nome-sistema" defaultValue="SEMA - Sistema de Gestão" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="versao">Versão</Label>
                <Input id="versao" defaultValue="1.0.0" disabled />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                defaultValue="Sistema de gerenciamento de alunos e atividades do Instituto SEMA"
              />
            </div>
            <Button>Salvar Configurações</Button>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>Configure as notificações do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificar novas inscrições</Label>
                <p className="text-sm text-muted-foreground">Enviar email quando houver nova inscrição</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificar faltas excessivas</Label>
                <p className="text-sm text-muted-foreground">Alertar quando aluno tiver muitas faltas</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Relatórios semanais</Label>
                <p className="text-sm text-muted-foreground">Enviar relatório semanal por email</p>
              </div>
              <Switch />
            </div>
            <Button>Salvar Notificações</Button>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>Configurações de segurança e acesso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticação de dois fatores</Label>
                <p className="text-sm text-muted-foreground">Exigir 2FA para administradores</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sessões múltiplas</Label>
                <p className="text-sm text-muted-foreground">Permitir login simultâneo em vários dispositivos</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tempo-sessao">Tempo de sessão (minutos)</Label>
              <Input id="tempo-sessao" type="number" defaultValue="480" />
            </div>
            <Button>Salvar Segurança</Button>
          </CardContent>
        </Card>

        {/* Backup e Manutenção */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup e Manutenção
            </CardTitle>
            <CardDescription>Configurações de backup e manutenção do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Backup automático</Label>
                <p className="text-sm text-muted-foreground">Fazer backup diário dos dados</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retencao-backup">Retenção de backup (dias)</Label>
              <Input id="retencao-backup" type="number" defaultValue="30" />
            </div>
            <div className="flex gap-2">
              <Button>Fazer Backup Agora</Button>
              <Button variant="outline">Restaurar Backup</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

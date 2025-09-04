import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, MoreHorizontal } from "lucide-react"
import Link from "next/link"

export default async function UsuariosPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") redirect("/dashboard")

  const { data: usuarios } = await supabase
    .from("profiles")
    .select(`
      *,
      inscricoes:inscricoes(count),
      presencas:presencas(count)
    `)
    .order("created_at", { ascending: false })

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "destructive",
      professor: "default",
      aluno: "secondary",
    }
    return <Badge variant={variants[role as keyof typeof variants]}>{role}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Gerencie todos os usuários do sistema SEMA</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/usuarios/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre usuários por tipo, unidade ou status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input placeholder="Buscar por nome ou email..." />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="professor">Professores</SelectItem>
                <SelectItem value="aluno">Alunos</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="carmem-cristina">Carmem Cristina</SelectItem>
                <SelectItem value="sao-clemente">São Clemente</SelectItem>
                <SelectItem value="nova-hortolandia">Nova Hortolândia</SelectItem>
                <SelectItem value="jardim-paulista">Jardim Paulista</SelectItem>
                <SelectItem value="nawampity">Nawampity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {usuarios?.map((usuario) => (
          <Card key={usuario.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">{usuario.nome?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{usuario.nome}</h3>
                    <p className="text-sm text-muted-foreground">{usuario.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(usuario.role)}
                      <Badge variant="outline">{usuario.unidade}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="font-medium">{usuario.inscricoes?.[0]?.count || 0} inscrições</p>
                    <p className="text-muted-foreground">{usuario.presencas?.[0]?.count || 0} presenças</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

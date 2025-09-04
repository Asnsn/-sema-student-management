"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  Home,
  Users,
  Calendar,
  ClipboardList,
  UserCheck,
  Settings,
  GraduationCap,
  BarChart3,
  LogOut,
} from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface MobileNavProps {
  userRole: string
  userName: string
}

export function MobileNav({ userRole, userName }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const getNavItems = () => {
    const baseItems = [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/dashboard/profile", label: "Perfil", icon: Users },
    ]

    if (userRole === "admin") {
      return [
        ...baseItems,
        { href: "/dashboard/admin/usuarios", label: "Usuários", icon: Users },
        { href: "/dashboard/admin/modalidades", label: "Modalidades", icon: Calendar },
        { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/dashboard/admin/configuracoes", label: "Configurações", icon: Settings },
      ]
    }

    if (userRole === "professor") {
      return [
        ...baseItems,
        { href: "/dashboard/professor/modalidades", label: "Minhas Turmas", icon: GraduationCap },
        { href: "/dashboard/professor/presenca", label: "Presença", icon: UserCheck },
        { href: "/dashboard/professor/inscricoes", label: "Inscrições", icon: ClipboardList },
      ]
    }

    if (userRole === "aluno") {
      return [
        ...baseItems,
        { href: "/dashboard/aluno/modalidades", label: "Atividades", icon: Calendar },
        { href: "/dashboard/aluno/frequencia", label: "Minha Frequência", icon: UserCheck },
        { href: "/dashboard/aluno/inscricoes/nova", label: "Nova Inscrição", icon: ClipboardList },
      ]
    }

    return baseItems
  }

  const navItems = getNavItems()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 pb-4 border-b">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <div>
              <h2 className="font-semibold">SEMA</h2>
              <p className="text-sm text-muted-foreground">Sistema de Gestão</p>
            </div>
          </div>

          <div className="py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">{userName?.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-medium text-sm">{userName}</p>
                <Badge variant="secondary" className="text-xs">
                  {userRole}
                </Badge>
              </div>
            </div>
          </div>

          <nav className="flex-1 py-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </nav>

          <div className="border-t pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

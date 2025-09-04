import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SEMA</h1>
          <p className="text-gray-600">Sistema de Gestão de Alunos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Verifique seu Email</CardTitle>
            <CardDescription className="text-center">Enviamos um link de confirmação para seu email</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Clique no link enviado para seu email para ativar sua conta e acessar o sistema SEMA.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Voltar ao Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

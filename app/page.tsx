import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Instituto SEMA</h1>
          <p className="text-xl text-gray-600 mb-2">Semeando Amor, Transformando Vidas</p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Sistema de gestão para professores, alunos e administradores das atividades esportivas, culturais e
            educacionais do Instituto SEMA.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Para Professores</CardTitle>
              <CardDescription>
                Gerencie suas turmas, controle presença e acompanhe o desenvolvimento dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li>• Controle de chamada digital</li>
                <li>• Cadastro e gestão de alunos</li>
                <li>• Aprovação de inscrições</li>
                <li>• Relatórios de frequência</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/auth/login">Acessar Sistema</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Para Alunos</CardTitle>
              <CardDescription>
                Visualize suas atividades, frequência e se inscreva em novas modalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                <li>• Portal do aluno personalizado</li>
                <li>• Histórico de presença</li>
                <li>• Inscrição em modalidades</li>
                <li>• Acompanhamento de atividades</li>
              </ul>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/auth/register">Criar Conta</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Nossas Unidades</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900">Carmem Cristina</h3>
              <p className="text-sm text-gray-600">Hortolândia</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900">São Clemente</h3>
              <p className="text-sm text-gray-600">Monte Mor</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900">Nova Hortolândia</h3>
              <p className="text-sm text-gray-600">Hortolândia</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900">Jardim Paulista</h3>
              <p className="text-sm text-gray-600">Monte Mor</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900">Nawampity</h3>
              <p className="text-sm text-gray-600">Uganda</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

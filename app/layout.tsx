import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "SEMA - Sistema de Gestão",
  description: "Sistema de gerenciamento de alunos e atividades do Instituto SEMA",
  generator: "v0.app",
  manifest: "/manifest.json",
  keywords: ["SEMA", "Instituto", "Educação", "Esportes", "Gestão", "Alunos"],
  authors: [{ name: "Instituto SEMA" }],
  creator: "Instituto SEMA",
  publisher: "Instituto SEMA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/icon-192x192.jpg",
    shortcut: "/icon-192x192.jpg",
    apple: "/icon-192x192.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SEMA",
  },
}

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

"use client"

import type React from "react"

import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import "./globals.css"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const searchParams = useSearchParams()

  return (
    <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      <Analytics />
    </body>
  )
}

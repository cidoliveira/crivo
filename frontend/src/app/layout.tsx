import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AutoU - Classificador de Emails",
  description: "Classificação inteligente de emails com IA",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`dark ${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen font-sans"
        style={{ background: 'var(--void)', color: 'var(--ink)' }}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}

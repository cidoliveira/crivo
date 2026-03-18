"use client"

import { useTheme } from "next-themes"
import { WarmupOverlay } from "@/components/warmup-overlay"
import { useBackendHealth } from "@/hooks/use-backend-health"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}

function MetricCardSkeleton({ label }: { label: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground font-normal">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24 mb-1" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  )
}

function ChartCardSkeleton({ label }: { label: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground font-normal">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-48 w-full" />
      </CardContent>
    </Card>
  )
}

function TableCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground font-normal">
          Historico de classificacoes
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { isSuccess } = useBackendHealth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <WarmupOverlay />

      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight">AutoU</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Classificador de Emails
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                Conectado
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-6">
        {/* Top row: 4 metric cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCardSkeleton label="Total processado" />
          <MetricCardSkeleton label="Produtivo %" />
          <MetricCardSkeleton label="Improdutivo %" />
          <MetricCardSkeleton label="Confianca media" />
        </section>

        {/* Middle row: 2 chart cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCardSkeleton label="Distribuicao por categoria" />
          <ChartCardSkeleton label="Volume ao longo do tempo" />
        </section>

        {/* Bottom: history table */}
        <section>
          <TableCardSkeleton />
        </section>
      </main>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Inbox, TrendingUp, TrendingDown, Percent } from "lucide-react"
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
import { EmailInput } from "@/components/email-input"
import { useClassify } from "@/hooks/use-classify"
import { ResultCard } from "@/components/result-card"
import { useMetrics } from "@/hooks/use-metrics"
import { useEmails } from "@/hooks/use-emails"
import { MetricCard } from "@/components/metric-card"
import { DonutChart } from "@/components/donut-chart"
import { ClassificationsLineChart } from "@/components/line-chart"
import { EmailsTable } from "@/components/emails-table"
import { EmptyState } from "@/components/empty-state"
import { BatchInput } from "@/components/batch-input"
import { BatchResults } from "@/components/batch-results"
import { useBatchClassify } from "@/hooks/use-batch-classify"
import { SeedButton } from "@/components/seed-button"

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
      className="size-10"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}

export default function DashboardPage() {
  const { isSuccess } = useBackendHealth()
  const [text, setText] = useState("")
  const [page, setPage] = useState(1)
  const [mode, setMode] = useState<"single" | "batch">("single")
  const classify = useClassify()
  const batch = useBatchClassify()
  const metrics = useMetrics()
  const emails = useEmails(page)

  const scrollToClassify = () =>
    document.getElementById("classify-section")?.scrollIntoView({ behavior: "smooth" })

  const handleClassify = () => {
    if (text.trim()) {
      classify.mutate(text.trim())
    }
  }

  const handleReset = () => {
    setText("")
    classify.reset()
  }

  // Derived metric values
  const produtivo = metrics.data?.by_label["Produtivo"] ?? 0
  const improdutivo = metrics.data?.by_label["Improdutivo"] ?? 0
  const total = metrics.data?.total ?? 0
  const pctProd = total ? Math.round((produtivo / total) * 100) : 0
  const pctImprod = total ? Math.round((improdutivo / total) * 100) : 0
  const avgConf = Math.round((metrics.data?.avg_confidence ?? 0) * 100)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <WarmupOverlay />

      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between">
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
            {isSuccess && <SeedButton />}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* Email input section */}
        <section id="classify-section" className="max-w-2xl">
          {/* Mode toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={mode === "single" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("single")}
            >
              Email individual
            </Button>
            <Button
              variant={mode === "batch" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("batch")}
            >
              Lote
            </Button>
          </div>

          {mode === "single" ? (
            <>
              <EmailInput
                text={text}
                onTextChange={setText}
                onClassify={handleClassify}
                isClassifying={classify.isPending}
                classifyError={classify.isError ? classify.error.message : null}
              />
              {classify.isSuccess && classify.data && (
                <div className="mt-4">
                  <ResultCard result={classify.data} onReset={handleReset} />
                </div>
              )}
            </>
          ) : (
            <>
              {batch.status === "idle" ? (
                <BatchInput
                  onBatchFromTexts={batch.runBatchFromTexts}
                  onBatchFromFiles={batch.runBatchFromFiles}
                  isProcessing={batch.status !== "idle"}
                  status={batch.status}
                />
              ) : (
                <BatchResults
                  status={batch.status}
                  items={batch.items}
                  summary={batch.summary}
                  error={batch.error}
                  onCancel={batch.cancel}
                  onReset={batch.reset}
                />
              )}
            </>
          )}
        </section>

        {/* Section header */}
        <h2 className="text-lg font-semibold">Painel de Metricas</h2>

        {/* Top row: 4 metric cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 -mt-4">
          {metrics.isSuccess && metrics.data ? (
            <>
              <MetricCard
                label="Total processado"
                value={total}
                icon={<Inbox size={16} />}
              />
              <MetricCard
                label="Produtivo %"
                value={`${pctProd}%`}
                sub={`${produtivo} de ${total}`}
                icon={<TrendingUp size={16} />}
              />
              <MetricCard
                label="Improdutivo %"
                value={`${pctImprod}%`}
                sub={`${improdutivo} de ${total}`}
                icon={<TrendingDown size={16} />}
              />
              <MetricCard
                label="Confianca media"
                value={`${avgConf}%`}
                icon={<Percent size={16} />}
              />
            </>
          ) : (
            <>
              {["Total processado", "Produtivo %", "Improdutivo %", "Confianca media"].map(
                (label) => (
                  <Card key={label}>
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
              )}
            </>
          )}
        </section>

        {metrics.isSuccess && metrics.data && total === 0 && (
          <div className="-mt-2">
            <EmptyState
              title="Sem dados no painel"
              description="Comece classificando um email para ver suas metricas"
              action={{ label: "Classificar email", onClick: scrollToClassify }}
            />
          </div>
        )}

        {/* Middle row: 2 chart cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.isSuccess && metrics.data ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Distribuicao por categoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart produtivo={produtivo} improdutivo={improdutivo} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Volume ao longo do tempo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ClassificationsLineChart data={metrics.data.daily_series} />
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {["Distribuicao por categoria", "Volume ao longo do tempo"].map((label) => (
                <Card key={label}>
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground font-normal">
                      {label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-48 w-full" />
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </section>

        {/* Bottom: history table */}
        <section>
          {emails.isSuccess && emails.data ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Historico de classificacoes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EmailsTable
                  data={emails.data}
                  page={page}
                  onPageChange={setPage}
                  onClassifyClick={scrollToClassify}
                />
              </CardContent>
            </Card>
          ) : (
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
          )}
        </section>
      </main>
    </div>
  )
}

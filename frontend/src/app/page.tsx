"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { WarmupOverlay } from "@/components/warmup-overlay"
import { useBackendHealth } from "@/hooks/use-backend-health"
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
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <button
      className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
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

  const produtivo = metrics.data?.by_label["Produtivo"] ?? 0
  const improdutivo = metrics.data?.by_label["Improdutivo"] ?? 0
  const total = metrics.data?.total ?? 0
  const pctProd = total ? Math.round((produtivo / total) * 100) : 0
  const pctImprod = total ? Math.round((improdutivo / total) * 100) : 0
  const avgConf = Math.round((metrics.data?.avg_confidence ?? 0) * 100)

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <WarmupOverlay />

      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 h-14 flex items-center justify-between">
          <div className="flex items-baseline gap-2.5">
            <span className="text-base font-semibold tracking-tight">AutoU</span>
            <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">
              email classifier
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Conectado
              </span>
            )}
            {isSuccess && <SeedButton />}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-8 flex flex-col gap-8">
        {/* Classify Section */}
        <section id="classify-section" className="max-w-2xl animate-fade-up">
          {/* Tab-style mode toggle */}
          <div className="flex gap-0.5 mb-5 p-0.5 bg-muted/60 rounded-lg w-fit">
            <button
              onClick={() => setMode("single")}
              className={cn(
                "px-3.5 py-1.5 text-sm rounded-md transition-all",
                mode === "single"
                  ? "bg-card text-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Individual
            </button>
            <button
              onClick={() => setMode("batch")}
              className={cn(
                "px-3.5 py-1.5 text-sm rounded-md transition-all",
                mode === "batch"
                  ? "bg-card text-foreground shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Lote
            </button>
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

        {/* Dashboard */}
        <div className="flex flex-col gap-5">
          <h2
            className="text-xs font-medium text-muted-foreground uppercase tracking-widest animate-fade-up"
            style={{ animationDelay: "60ms" }}
          >
            Métricas
          </h2>

          {/* Unified metrics strip */}
          {metrics.isSuccess && metrics.data ? (
            <div
              className="rounded-xl border border-border bg-card overflow-hidden animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4">
                <div className="p-4 sm:p-5 border-b lg:border-b-0 border-r border-border">
                  <MetricCard label="Total processado" value={total} />
                </div>
                <div className="p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-border">
                  <MetricCard
                    label="Produtivo"
                    value={`${pctProd}%`}
                    sub={`${produtivo} de ${total}`}
                  />
                </div>
                <div className="p-4 sm:p-5 border-r border-border">
                  <MetricCard
                    label="Improdutivo"
                    value={`${pctImprod}%`}
                    sub={`${improdutivo} de ${total}`}
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <MetricCard label="Confiança" value={`${avgConf}%`} />
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-xl border border-border bg-card p-5 animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {["Total processado", "Produtivo", "Improdutivo", "Confiança"].map(
                  (label) => (
                    <div key={label} className="flex flex-col gap-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-7 w-16" />
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {metrics.isSuccess && metrics.data && total === 0 && (
            <EmptyState
              title="Sem dados no painel"
              description="Comece classificando um email para ver suas métricas"
              action={{ label: "Classificar email", onClick: scrollToClassify }}
            />
          )}

          {/* Charts — asymmetric 3/2 */}
          <section
            className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            {metrics.isSuccess && metrics.data ? (
              <>
                <div className="md:col-span-3 flex flex-col gap-2">
                  <h3 className="text-xs font-medium text-muted-foreground">
                    Volume ao longo do tempo
                  </h3>
                  <div className="rounded-xl border border-border bg-card p-5 flex-1">
                    <ClassificationsLineChart data={metrics.data.daily_series} />
                  </div>
                </div>
                <div className="md:col-span-2 flex flex-col gap-2">
                  <h3 className="text-xs font-medium text-muted-foreground">
                    Distribuição por categoria
                  </h3>
                  <div className="rounded-xl border border-border bg-card p-5 flex-1">
                    <DonutChart produtivo={produtivo} improdutivo={improdutivo} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="md:col-span-3 flex flex-col gap-2">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-56 w-full rounded-xl" />
                </div>
                <div className="md:col-span-2 flex flex-col gap-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-56 w-full rounded-xl" />
                </div>
              </>
            )}
          </section>

          {/* History */}
          <section
            className="flex flex-col gap-2 animate-fade-up"
            style={{ animationDelay: "220ms" }}
          >
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Histórico
            </h3>
            {emails.isSuccess && emails.data ? (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <EmailsTable
                  data={emails.data}
                  page={page}
                  onPageChange={setPage}
                  onClassifyClick={scrollToClassify}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

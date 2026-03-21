"use client"

import { useState } from "react"
import { Topbar } from "@/components/topbar"
import { MetricsStrip } from "@/components/metrics-strip"
import { ClassificationsLineChart } from "@/components/line-chart"
import { DonutChart } from "@/components/donut-chart"
import { EmailsTable } from "@/components/emails-table"
import { SeedButton } from "@/components/seed-button"
import { EmptyState } from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useMetrics } from "@/hooks/use-metrics"
import { useEmails } from "@/hooks/use-emails"
import { useBackendHealth } from "@/hooks/use-backend-health"

function ChartCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div
      className="rounded-[10px] p-4 transition-colors duration-150"
      style={{
        background:
          "linear-gradient(160deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)",
        border: "1px solid var(--rule)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--rule-strong)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--rule)")
      }
    >
      <div
        className="text-[12px] mb-3"
        style={{ color: "var(--ink-secondary)", fontWeight: 550 }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[10px] transition-colors duration-150 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)",
        border: "1px solid var(--rule)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--rule-strong)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--rule)")
      }
    >
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const [page, setPage] = useState(1)
  const metrics = useMetrics()
  const emails = useEmails(page)
  const health = useBackendHealth()

  const isEmpty =
    metrics.isSuccess &&
    emails.isSuccess &&
    metrics.data.total === 0 &&
    emails.data.items.length === 0

  return (
    <>
      <Topbar title="Visao geral" pill="30 dias">
        {health.isSuccess && <SeedButton />}
      </Topbar>

      <div className="p-5 lg:p-6 space-y-4">
        {/* Metrics strip */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: `${0 * 60}ms` }}
        >
          {metrics.isSuccess ? (
            <MetricsStrip data={metrics.data} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-[10px] overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[88px]" />
              ))}
            </div>
          )}
        </div>

        {/* Charts grid */}
        <div
          className="animate-fade-up grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-2.5"
          style={{ animationDelay: `${1 * 60}ms` }}
        >
          <ChartCard title="Classificacoes diarias">
            {metrics.isSuccess ? (
              <ClassificationsLineChart data={metrics.data.daily_series} />
            ) : (
              <Skeleton className="h-[180px] rounded-lg" />
            )}
          </ChartCard>

          <ChartCard title="Distribuicao">
            {metrics.isSuccess ? (
              <DonutChart
                produtivo={metrics.data.by_label?.Produtivo ?? 0}
                improdutivo={metrics.data.by_label?.Improdutivo ?? 0}
              />
            ) : (
              <Skeleton className="h-[180px] rounded-lg" />
            )}
          </ChartCard>
        </div>

        {/* Emails table */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: `${2 * 60}ms` }}
        >
          {emails.isSuccess ? (
            isEmpty ? (
              <TableCard>
                <EmptyState
                  title="Nenhuma classificacao ainda"
                  description="Classifique emails ou carregue dados demo para comecar"
                />
              </TableCard>
            ) : (
              <TableCard>
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[12px]"
                      style={{
                        color: "var(--ink-secondary)",
                        fontWeight: 550,
                      }}
                    >
                      Emails recentes
                    </span>
                    <span
                      className="text-[10px] font-medium tabular-nums"
                      style={{
                        color: "var(--ink-ghost)",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid var(--rule)",
                        padding: "1px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      {emails.data.total}
                    </span>
                  </div>
                </div>
                <div className="px-2 pb-3">
                  <EmailsTable
                    data={emails.data}
                    page={page}
                    onPageChange={setPage}
                  />
                </div>
              </TableCard>
            )
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

"use client"

import { Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { BatchItemResult, BatchSummary, BatchStatus } from "@/hooks/use-batch-classify"

interface BatchResultsProps {
  status: BatchStatus
  items: BatchItemResult[]
  summary: BatchSummary | null
  error: string | null
  onCancel: () => void
  onReset: () => void
}

// Static lookup to avoid Tailwind v4 purging dynamic class strings
const LABEL_STYLES: Record<string, string> = {
  Produtivo: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Improdutivo: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
}

function truncate(text: string, max = 60): string {
  return text.length <= max ? text : text.slice(0, max) + "..."
}

export function BatchResults({
  status,
  items,
  summary,
  error,
  onCancel,
  onReset,
}: BatchResultsProps) {
  // Error state
  if (status === "error") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Classificacao em Lote</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-destructive">{error ?? "Ocorreu um erro ao processar o lote."}</p>
          <div>
            <Button variant="outline" size="sm" onClick={onReset}>
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Complete state
  if (status === "complete" && summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Resultado do Lote</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {/* Summary card */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-lg font-semibold">{summary.total}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Sucesso</span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {summary.successful}
                </span>
              </div>
              {summary.failed > 0 && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Falhas</span>
                  <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                    {summary.failed}
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Confianca media</span>
                <span className="text-lg font-semibold">
                  {Math.round(summary.avg_confidence * 100)}%
                </span>
              </div>
            </div>

            {/* By label breakdown */}
            {Object.keys(summary.by_label).length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {Object.entries(summary.by_label).map(([label, count]) => (
                  <span
                    key={label}
                    className={[
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      LABEL_STYLES[label] ?? "border-border",
                    ].join(" ")}
                  >
                    {label}: {count}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Full results list */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Itens processados
            </p>
            <div className="flex flex-col divide-y divide-border rounded-lg border border-border overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.index}
                  className="flex items-center gap-3 px-3 py-2 text-sm bg-card"
                >
                  <span className="text-muted-foreground tabular-nums w-5 shrink-0">
                    {item.index + 1}
                  </span>
                  <span className="flex-1 truncate text-muted-foreground">
                    {item.error
                      ? truncate(item.error, 60)
                      : truncate(item.suggestion.split("\n")[0] || "", 60)}
                  </span>
                  {item.error ? (
                    <span className="inline-flex items-center rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-xs text-destructive shrink-0">
                      Erro
                    </span>
                  ) : (
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0",
                        LABEL_STYLES[item.label] ?? "border-border",
                      ].join(" ")}
                    >
                      {item.label}
                    </span>
                  )}
                  {!item.error && (
                    <span className="tabular-nums text-xs text-muted-foreground w-10 text-right shrink-0">
                      {Math.round(item.confidence * 100)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Button variant="outline" size="sm" onClick={onReset}>
              Nova classificacao em lote
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Processing state (extracting | running)
  const isExtracting = status === "extracting"
  const total = items[0]?.total ?? 0
  const processed = items.length
  const pct = total > 0 ? Math.round((processed / total) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Classificacao em Lote</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Status text */}
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
          <span className="text-sm text-muted-foreground">
            {isExtracting
              ? "Extraindo arquivos..."
              : total > 0
              ? `Classificando email ${processed} de ${total}...`
              : "Iniciando classificacao..."}
          </span>
        </div>

        {/* Progress bar */}
        {!isExtracting && (
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}

        {/* Live feed of completed items */}
        {items.length > 0 && (
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div
                key={item.index}
                className="flex items-center gap-3 rounded-md px-3 py-1.5 text-sm bg-muted/30"
              >
                <span className="text-muted-foreground tabular-nums w-5 shrink-0">
                  {item.index + 1}
                </span>
                <span className="flex-1 truncate text-muted-foreground">
                  {item.error
                    ? truncate(item.error, 60)
                    : truncate(item.suggestion.split("\n")[0] || "", 60)}
                </span>
                {item.error ? (
                  <span className="inline-flex items-center rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-xs text-destructive shrink-0">
                    Erro
                  </span>
                ) : (
                  <span
                    className={[
                      "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium shrink-0",
                      LABEL_STYLES[item.label] ?? "border-border",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                )}
                {!item.error && (
                  <span className="tabular-nums text-xs text-muted-foreground w-10 text-right shrink-0">
                    {Math.round(item.confidence * 100)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div>
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

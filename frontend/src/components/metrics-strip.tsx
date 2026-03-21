import type { MetricsData } from "@/hooks/use-metrics"

interface MetricsStripProps {
  data: MetricsData
}

function computeWeeklyDelta(dailySeries: { day: string; count: number }[]): number {
  if (dailySeries.length < 7) return 0
  return dailySeries.slice(-7).reduce((sum, d) => sum + d.count, 0)
}

export function MetricsStrip({ data }: MetricsStripProps) {
  const total = data.total
  const prodPct = total > 0 ? Math.round(((data.by_label?.Produtivo ?? 0) / total) * 100) : 0
  const improdPct = total > 0 ? 100 - prodPct : 0
  const confPct = Math.round(data.avg_confidence * 100)
  const weeklyDelta = computeWeeklyDelta(data.daily_series)

  const cells = [
    {
      label: "Total classificados",
      value: total.toString(),
      color: "var(--ink)",
      detail: weeklyDelta > 0 ? `+${weeklyDelta} esta semana` : undefined,
      detailType: "delta" as const,
    },
    {
      label: "Produtivos",
      value: prodPct,
      unit: "%",
      color: "var(--stamp-approved)",
      detail: `${data.by_label?.Produtivo ?? 0} de ${total} emails`,
      detailType: "sub" as const,
    },
    {
      label: "Improdutivos",
      value: improdPct,
      unit: "%",
      color: "var(--stamp-rejected)",
      detail: `${data.by_label?.Improdutivo ?? 0} de ${total} emails`,
      detailType: "sub" as const,
    },
    {
      label: "Confiança média",
      value: confPct,
      unit: "%",
      color: "var(--ink)",
      detail: "+2.4%",
      detailType: "delta" as const,
    },
  ]

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-[10px]"
      style={{ gap: '1px', background: 'var(--rule)' }}
    >
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="transition-colors duration-150"
          style={{
            background: 'var(--void)',
            padding: '18px 20px',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.012)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--void)')}
        >
          <div className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--ink-tertiary)' }}>
            {cell.label}
          </div>
          <div
            className="text-2xl font-bold tracking-tight tabular-nums font-mono leading-none"
            style={{ color: cell.color }}
          >
            {cell.value}
            {cell.unit && (
              <span className="text-sm font-medium tracking-normal" style={{ color: 'var(--ink-secondary)' }}>
                {cell.unit}
              </span>
            )}
          </div>
          {cell.detail && (
            <div
              className="text-[10px] font-medium mt-1.5 tabular-nums"
              style={{
                color: cell.detailType === "delta" ? 'var(--stamp-approved)' : 'var(--ink-ghost)',
              }}
            >
              {cell.detail}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

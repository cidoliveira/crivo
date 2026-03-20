interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
}

export function MetricCard({ label, value, sub }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold font-mono tabular-nums tracking-tight">
        {value}
      </span>
      {sub && (
        <span className="text-xs text-muted-foreground">{sub}</span>
      )}
    </div>
  )
}

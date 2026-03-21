interface DonutChartProps {
  produtivo: number
  improdutivo: number
}

export function DonutChart({ produtivo, improdutivo }: DonutChartProps) {
  const total = produtivo + improdutivo
  const r = 46
  const circumference = 2 * Math.PI * r
  const prodFill = total > 0 ? (produtivo / total) * circumference : 0
  const improdFill = total > 0 ? (improdutivo / total) * circumference : 0

  return (
    <div className="flex items-center justify-center gap-6" style={{ height: 180 }}>
      <div className="relative flex items-center justify-center">
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="9" />
          {/* Produtivo arc */}
          {prodFill > 0 && (
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--stamp-approved)" strokeWidth="9" strokeLinecap="round"
              strokeDasharray={`${prodFill} ${circumference - prodFill}`} />
          )}
          {/* Improdutivo arc */}
          {improdFill > 0 && (
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--stamp-rejected)" strokeWidth="9" strokeLinecap="round"
              strokeDasharray={`${improdFill} ${circumference - improdFill}`}
              strokeDashoffset={`${-prodFill}`} />
          )}
        </svg>
        {/* Center text */}
        <div className="absolute flex flex-col items-center" style={{ transform: 'none' }}>
          <span className="text-[22px] font-bold tabular-nums" style={{ color: 'var(--ink)', letterSpacing: '-0.8px' }}>{total}</span>
          <span className="text-[9px]" style={{ color: 'var(--ink-ghost)' }}>total</span>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-sm" style={{ background: 'var(--stamp-approved)' }} />
          <span className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>Produtivo</span>
          <span className="text-xs font-semibold tabular-nums ml-auto pl-3" style={{ color: 'var(--ink)' }}>{produtivo}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-sm" style={{ background: 'var(--stamp-rejected)' }} />
          <span className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>Improdutivo</span>
          <span className="text-xs font-semibold tabular-nums ml-auto pl-3" style={{ color: 'var(--ink)' }}>{improdutivo}</span>
        </div>
      </div>
    </div>
  )
}

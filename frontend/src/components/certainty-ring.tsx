interface CertaintyRingProps {
  confidence: number // 0-100
  size?: number
}

export function CertaintyRing({ confidence, size = 28 }: CertaintyRingProps) {
  const r = 11
  const circumference = 2 * Math.PI * r
  const filled = (confidence / 100) * circumference
  const gap = circumference - filled

  const tier =
    confidence >= 80 ? 'var(--certainty-high)' :
    confidence >= 60 ? 'var(--certainty-mid)' :
    'var(--certainty-low)'

  return (
    <span className="inline-flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        className="shrink-0"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx="14" cy="14" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="2.5"
        />
        <circle
          cx="14" cy="14" r={r}
          fill="none"
          stroke={tier}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${gap}`}
          style={{ transition: 'stroke-dasharray 0.3s ease-out' }}
        />
      </svg>
      <span
        className="text-xs font-medium tabular-nums font-mono"
        style={{ color: 'var(--ink-secondary)' }}
      >
        {confidence}%
      </span>
    </span>
  )
}

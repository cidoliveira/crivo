interface StampProps {
  label: "Produtivo" | "Improdutivo"
}

export function Stamp({ label }: StampProps) {
  const isApproved = label === "Produtivo"

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{
          background: isApproved ? 'var(--stamp-approved)' : 'var(--stamp-rejected)',
          boxShadow: isApproved
            ? '0 0 4px var(--stamp-approved-dim)'
            : '0 0 4px var(--stamp-rejected-dim)',
        }}
      />
      <span style={{ color: isApproved ? 'var(--stamp-approved)' : 'var(--stamp-rejected)' }}>
        {label}
      </span>
    </span>
  )
}

"use client"

import { useSeed } from "@/hooks/use-seed"

export function SeedButton() {
  const seed = useSeed()

  return (
    <button
      onClick={() => seed.mutate()}
      disabled={seed.isPending}
      className="flex items-center gap-1.5 text-xs font-medium transition-colors duration-100 disabled:opacity-50"
      style={{
        padding: '5px 10px',
        borderRadius: '6px',
        border: '1px solid var(--rule)',
        background: 'transparent',
        color: 'var(--ink-tertiary)',
        cursor: seed.isPending ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={e => {
        if (!seed.isPending) {
          e.currentTarget.style.background = 'var(--paper-hover)'
          e.currentTarget.style.borderColor = 'var(--rule-strong)'
          e.currentTarget.style.color = 'var(--ink-secondary)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'var(--rule)'
        e.currentTarget.style.color = 'var(--ink-tertiary)'
      }}
    >
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M8 2v12M4 6l4-4 4 4"/>
      </svg>
      {seed.isPending ? "Carregando..." : "Seed"}
    </button>
  )
}

"use client"

import Link from "next/link"
import { WarmupOverlay } from "@/components/warmup-overlay"

export default function LandingPage() {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center relative z-[1]"
      style={{
        background: `
          radial-gradient(ellipse 60% 45% at 50% 0%, rgba(45,212,160,0.03) 0%, transparent 55%),
          radial-gradient(ellipse 40% 35% at 50% 100%, rgba(45,212,160,0.015) 0%, transparent 45%)
        `,
      }}
    >
      <WarmupOverlay />

      <div className="flex flex-col items-center gap-6 px-5 text-center animate-fade-up">
        {/* Wordmark */}
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'var(--ink)', letterSpacing: '-1px' }}
        >
          AutoU
        </h1>

        {/* Subtitle */}
        <p
          className="text-sm max-w-xs"
          style={{ color: 'var(--ink-tertiary)' }}
        >
          Classificador de emails com inteligência artificial
        </p>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150"
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            background: 'var(--stamp-approved)',
            color: 'var(--void)',
          }}
        >
          Acessar dashboard
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>

        {/* Subtle tech badge */}
        <span
          className="text-[10px] font-mono tabular-nums"
          style={{ color: 'var(--ink-ghost)' }}
        >
          v1.0 · Next.js + FastAPI + Claude
        </span>
      </div>
    </div>
  )
}

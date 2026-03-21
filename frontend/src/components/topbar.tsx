"use client"

import type { ReactNode } from "react"

interface TopbarProps {
  title: string
  pill?: string
  children?: ReactNode
}

export function Topbar({ title, pill, children }: TopbarProps) {
  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between"
      style={{
        padding: '12px 24px',
        background: 'rgba(10,10,11,0.88)',
        backdropFilter: 'blur(14px) saturate(115%)',
        borderBottom: '1px solid var(--rule)',
      }}
    >
      <div className="flex items-center gap-1.5">
        {/* Hamburger placeholder for mobile — MobileNav will be added in Task 8 */}
        <span
          className="text-[13px] font-semibold"
          style={{ color: 'var(--ink)', letterSpacing: '-0.2px' }}
        >
          {title}
        </span>
        {pill && (
          <span
            className="text-[10px] font-medium"
            style={{
              color: 'var(--ink-ghost)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--rule)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {pill}
          </span>
        )}
      </div>
      {children && (
        <div className="flex gap-1.5">
          {children}
        </div>
      )}
    </header>
  )
}

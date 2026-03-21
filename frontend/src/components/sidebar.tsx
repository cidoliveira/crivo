"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useBackendHealth } from "@/hooks/use-backend-health"

const navItems = [
  {
    label: "Visão geral",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="2" y="2" width="5" height="5" rx="1" />
        <rect x="9" y="2" width="5" height="3.5" rx="1" />
        <rect x="9" y="7.5" width="5" height="6.5" rx="1" />
        <rect x="2" y="9" width="5" height="5" rx="1" />
      </svg>
    ),
  },
  {
    label: "Classificar",
    href: "/classify",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M4 8h8" />
        <path d="M8 4v8" />
      </svg>
    ),
  },
  {
    label: "Histórico",
    href: "/history",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M3 5h10M3 8h10M3 11h6" />
      </svg>
    ),
  },
]

const secondaryItems = [
  {
    label: "Lote",
    href: "/classify?mode=batch",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="2" y="4" width="12" height="9" rx="1.5" />
        <path d="M2 6.5l6 3.5 6-3.5" />
      </svg>
    ),
  },
  {
    label: "Atividade",
    href: "/dashboard",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="8" cy="8" r="5.5" />
        <path d="M8 5v3.5h2.5" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const health = useBackendHealth()
  const isConnected = health.isSuccess

  function isActive(href: string) {
    if (href.includes("?")) return pathname === href.split("?")[0]
    return pathname.startsWith(href)
  }

  function renderNavItem(item: { label: string; href: string; icon: React.ReactNode }) {
    const active = isActive(item.href)
    return (
      <Link
        key={item.label}
        href={item.href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 450,
          cursor: "pointer",
          textDecoration: "none",
          color: active ? "var(--ink)" : "var(--ink-tertiary)",
          background: active ? "rgba(255,255,255,0.05)" : "transparent",
          transition: "color 0.15s, background 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.color = "var(--ink-secondary)"
            e.currentTarget.style.background = "var(--paper-hover)"
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.color = "var(--ink-tertiary)"
            e.currentTarget.style.background = "transparent"
          }
        }}
      >
        <span
          style={{
            width: 15,
            height: 15,
            flexShrink: 0,
            opacity: active ? 0.8 : 0.45,
          }}
        >
          {item.icon}
        </span>
        {item.label}
      </Link>
    )
  }

  return (
    <aside
      style={{
        width: 228,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--rule)",
        padding: "0 6px",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "18px 10px 4px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.5, color: "var(--ink)" }}>
          Crivo
        </span>
        <span
          style={{
            width: 1,
            height: 12,
            background: "var(--rule-strong)",
          }}
        />
        <span style={{ fontSize: 12, fontWeight: 450, color: "var(--ink-tertiary)" }}>
          Workspace
        </span>
      </div>

      {/* Search hint */}
      <div
        style={{
          margin: "10px 4px 2px",
          padding: "6px 10px",
          borderRadius: 7,
          border: "1px solid var(--rule)",
          background: "rgba(255,255,255,0.012)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--rule-strong)"
          e.currentTarget.style.background = "rgba(255,255,255,0.025)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--rule)"
          e.currentTarget.style.background = "rgba(255,255,255,0.012)"
        }}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ width: 13, height: 13, flexShrink: 0, color: "var(--ink-ghost)" }}
        >
          <circle cx="6.5" cy="6.5" r="4.2" />
          <path d="M10 10l3.5 3.5" />
        </svg>
        <span style={{ fontSize: 12, color: "var(--ink-ghost)", flex: 1 }}>Buscar...</span>
        <kbd
          style={{
            fontSize: 9,
            fontWeight: 500,
            color: "var(--ink-ghost)",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--rule)",
            borderRadius: 3,
            padding: "1px 4px",
            lineHeight: 1.4,
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "8px 0", flex: 1 }}>
        {navItems.map(renderNavItem)}
        <div style={{ height: 1, background: "var(--rule)", margin: "6px 10px" }} />
        {secondaryItems.map(renderNavItem)}
      </nav>

      {/* Footer — API status */}
      <div
        style={{
          padding: "10px 4px 14px",
          borderTop: "1px solid var(--rule)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            flexShrink: 0,
            background: isConnected ? "var(--stamp-approved)" : "var(--ink-ghost)",
            boxShadow: isConnected ? "0 0 5px rgba(45,212,160,0.3)" : "none",
          }}
        />
        <span style={{ fontSize: 11, color: "var(--ink-ghost)" }}>
          {isConnected ? "API conectada" : "API offline"}
        </span>
        <span
          style={{
            fontSize: 10,
            color: "var(--ink-ghost)",
            fontVariantNumeric: "tabular-nums",
            fontFamily: "var(--font-mono)",
            marginLeft: "auto",
          }}
        >
          {health.data?.latencyMs ?? "--"}ms
        </span>
      </div>
    </aside>
  )
}

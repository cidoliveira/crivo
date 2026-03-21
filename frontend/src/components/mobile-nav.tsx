"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

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

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

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
        onClick={() => setOpen(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 450,
          cursor: "pointer",
          textDecoration: "none",
          color: active ? "var(--ink)" : "var(--ink-tertiary)",
          background: active ? "rgba(255,255,255,0.05)" : "transparent",
          transition: "color 0.15s, background 0.15s",
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: 6,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "var(--ink-tertiary)",
          padding: 0,
          transition: "color 0.15s, background 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--ink)"
          e.currentTarget.style.background = "rgba(255,255,255,0.05)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--ink-tertiary)"
          e.currentTarget.style.background = "transparent"
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        >
          <path d="M2.5 4h11" />
          <path d="M2.5 8h11" />
          <path d="M2.5 12h11" />
        </svg>
      </SheetTrigger>

      <SheetContent
        side="left"
        showCloseButton={false}
        style={{
          background: "var(--void)",
          borderColor: "var(--rule)",
        }}
      >
        <SheetHeader style={{ padding: "18px 16px 4px" }}>
          <SheetTitle
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: -0.5,
              color: "var(--ink)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Crivo
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
          </SheetTitle>
          <SheetDescription className="sr-only">
            Menu de navegação
          </SheetDescription>
        </SheetHeader>

        <nav style={{ padding: "8px 12px", flex: 1 }}>
          {navItems.map(renderNavItem)}
          <div style={{ height: 1, background: "var(--rule)", margin: "6px 12px" }} />
          {secondaryItems.map(renderNavItem)}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

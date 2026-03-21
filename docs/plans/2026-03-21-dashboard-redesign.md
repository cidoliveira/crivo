# Dashboard Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the single-page AutoU dashboard into a sidebar-navigated, premium dark-mode app with product-world tokens, signature confidence gauges, and responsive mobile layout.

**Architecture:** Next.js App Router route group `(app)/` wraps Dashboard, Classify, and History pages with a shared Sidebar + Topbar layout. Landing page at `/` remains standalone. All styling migrates from dual-theme shadcn tokens to a single dark-mode product token system.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Recharts, TanStack Query v5

**Reference:** Design spec at `docs/superpowers/specs/2026-03-20-dashboard-redesign-design.md`, visual mockup at `.superpowers/brainstorm/8777-1774047330/premium-dashboard-v4.html`

---

## Task 1: Design tokens + texture layer

Replace the dual-theme token system in globals.css with dark-only product-world tokens and add the texture layer.

**Files:**
- Modify: `frontend/src/app/globals.css`

**Step 1: Read the current globals.css**

Read `frontend/src/app/globals.css` completely to understand the current token structure.

**Step 2: Replace the full file**

Replace the entire contents of `globals.css` with the new token system. Key changes:

1. Keep the imports: `@import "tailwindcss"`, `@import "tw-animate-css"`, `@import "tailwindcss/preflight" layer(base)`
2. Remove the `@import "../components/ui/tailwind.css"` line — we'll inline what's needed
3. Replace the `@theme inline` block with new product tokens mapped to Tailwind:
   - Map `--color-background` to `var(--void)` (#0a0a0b)
   - Map `--color-foreground` to `var(--ink)` (#ececee)
   - Map `--color-card` to `var(--paper)` (#111113)
   - Map `--color-muted` to `var(--paper)`, `--color-muted-foreground` to `var(--ink-tertiary)`
   - Map `--color-border` to `var(--rule)` value
   - Map `--color-primary` to `var(--stamp-approved)` (#2dd4a0)
   - Map `--color-destructive` to `var(--stamp-rejected)` (#e06c6c)
   - Keep all `--radius-*` calculations unchanged
   - Keep `--font-sans` and `--font-mono` mapped to Geist variables
4. Remove the `@custom-variant dark` section and the `.dark { }` overrides entirely — app is dark-only now
5. Add product tokens as CSS custom properties in `:root`:

```css
:root {
  --void: #0a0a0b;
  --paper: #111113;
  --paper-raised: #161618;
  --paper-hover: rgba(255,255,255,0.035);

  --ink: #ececee;
  --ink-secondary: #9d9da6;
  --ink-tertiary: #5c5c66;
  --ink-ghost: #38383f;

  --rule: rgba(255,255,255,0.055);
  --rule-strong: rgba(255,255,255,0.09);

  --stamp-approved: #2dd4a0;
  --stamp-approved-dim: rgba(45,212,160,0.08);
  --stamp-approved-border: rgba(45,212,160,0.14);
  --stamp-rejected: #e06c6c;
  --stamp-rejected-dim: rgba(224,108,108,0.08);
  --stamp-rejected-border: rgba(224,108,108,0.14);

  --certainty-high: #2dd4a0;
  --certainty-mid: #c9a227;
  --certainty-low: #e06c6c;
}
```

6. Add texture layer after `:root`:

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.022'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px;
}
```

7. Keep the existing `@keyframes fade-up` and `.animate-fade-up` utility unchanged.

**Step 3: Verify build**

Run: `cd frontend && npm run build`
Expected: Build succeeds. There may be visual regressions (expected — we're mid-migration).

**Step 4: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "feat: replace dual-theme tokens with dark-only product token system"
```

---

## Task 2: Remove ThemeProvider

Strip `next-themes` from providers and layout.

**Files:**
- Modify: `frontend/src/components/providers.tsx`
- Modify: `frontend/src/app/layout.tsx`

**Step 1: Update providers.tsx**

Remove the `ThemeProvider` import and wrapper. Keep only `QueryClientProvider`:

```tsx
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode, useState } from "react"

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000 },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

**Step 2: Update layout.tsx**

Remove `suppressHydrationWarning` from `<html>` (was needed for theme switching). Add `className="dark"` to `<html>` so shadcn components that check for dark class still work. Update `<body>` to use new token colors:

```tsx
<html lang="pt-BR" className="dark">
  <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}
    style={{ background: 'var(--void)', color: 'var(--ink)' }}>
```

**Step 3: Verify build**

Run: `cd frontend && npm run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add frontend/src/components/providers.tsx frontend/src/app/layout.tsx
git commit -m "feat: remove ThemeProvider, dark-only mode"
```

---

## Task 3: Stamp component

Create the category dot + text indicator that replaces pill badges.

**Files:**
- Create: `frontend/src/components/stamp.tsx`

**Step 1: Create the component**

```tsx
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
```

**Step 2: Verify build**

Run: `cd frontend && npm run build`
Expected: PASS (component unused yet, but must compile)

**Step 3: Commit**

```bash
git add frontend/src/components/stamp.tsx
git commit -m "feat: add Stamp component for category display"
```

---

## Task 4: CertaintyRing component

Create the signature confidence gauge SVG ring.

**Files:**
- Create: `frontend/src/components/certainty-ring.tsx`

**Step 1: Create the component**

The ring is a 28x28 SVG with a background circle and a foreground arc that fills proportionally. The circumference of the ring (r=11) is `2 * PI * 11 ≈ 69.1`. The fill length = `(confidence / 100) * 69.1`.

```tsx
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
```

**Step 2: Verify build**

Run: `cd frontend && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/components/certainty-ring.tsx
git commit -m "feat: add CertaintyRing signature confidence gauge"
```

---

## Task 5: MetricsStrip component

Create the unified metrics panel replacing 4 separate MetricCards.

**Files:**
- Create: `frontend/src/components/metrics-strip.tsx`

**Step 1: Create the component**

```tsx
import type { MetricsData } from "@/hooks/use-metrics"

interface MetricsStripProps {
  data: MetricsData
}

function computeWeeklyDelta(dailySeries: { date: string; count: number }[]): number {
  if (dailySeries.length < 7) return 0
  return dailySeries.slice(-7).reduce((sum, d) => sum + d.count, 0)
}

function computeConfidenceDelta(dailySeries: { date: string; count: number }[]): string {
  // placeholder — returns static for now since backend doesn't provide historical confidence
  return "+2.4%"
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
      detail: computeConfidenceDelta(data.daily_series),
      detailType: "delta" as const,
    },
  ]

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden rounded-[10px]"
      style={{ gap: '1px', background: 'var(--rule)' }}
    >
      {cells.map((cell, i) => (
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
```

**Step 2: Verify build**

Run: `cd frontend && npm run build`
Expected: PASS (check that MetricsData type import resolves correctly — may need to export it from the hook)

**Step 3: Commit**

```bash
git add frontend/src/components/metrics-strip.tsx
git commit -m "feat: add MetricsStrip unified metrics panel"
```

---

## Task 6: Sidebar component

Create the sidebar navigation with wordmark, search hint, nav items, and API status.

**Files:**
- Create: `frontend/src/components/sidebar.tsx`

**Step 1: Create the component**

This is a `"use client"` component that uses `usePathname()` from `next/navigation` and `Link` from `next/link`. It also uses `useBackendHealth` for the API status indicator.

Navigation items:
- Visão geral → `/dashboard` (bento grid icon)
- Classificar → `/classify` (plus icon)
- Histórico → `/history` (list icon)
- divider
- Lote → `/classify?mode=batch` (mail icon)
- Atividade → `/dashboard` (clock icon, visual-only)

Icon SVGs: use inline `<svg>` elements with `stroke="currentColor"` and `strokeWidth={1.2}`, matching the v4 mockup.

Active state: compare `pathname` starts with the nav item's href. Apply `background: rgba(255,255,255,0.05)` and brighter text.

Footer: API dot (green when healthy) + "API conectada" + latency in mono.

The full component should be approximately 120-150 lines. Reference the v4 mockup HTML for exact SVG paths and spacing.

**Step 2: Verify build**

Run: `cd frontend && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/components/sidebar.tsx
git commit -m "feat: add Sidebar navigation component"
```

---

## Task 7: Topbar component

Create the sticky top bar with page title, context pill, and action buttons.

**Files:**
- Create: `frontend/src/components/topbar.tsx`

**Step 1: Create the component**

`"use client"` component. Props:
- `title: string` — page title
- `pill?: string` — optional context badge (e.g., "30 dias")
- `children?: ReactNode` — slot for action buttons (Seed, etc.)

For mobile (below lg), render a hamburger button that triggers `MobileNav`. For now, just render the layout — MobileNav comes in Task 8.

Styling from v4 mockup:
- `position: sticky; top: 0; z-index: 10`
- `background: rgba(10,10,11,0.88); backdrop-filter: blur(14px) saturate(115%)`
- `border-bottom: 1px solid var(--rule)`
- `padding: 12px 24px` (16px on mobile)

**Step 2: Verify build**

Run: `cd frontend && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/components/topbar.tsx
git commit -m "feat: add Topbar sticky header component"
```

---

## Task 8: MobileNav component

Hamburger button + Sheet overlay with navigation for mobile.

**Files:**
- Create: `frontend/src/components/mobile-nav.tsx`

**Step 1: Create the component**

`"use client"` component using shadcn `Sheet` (if available) or a simple state-driven overlay. Contains the same nav items as `Sidebar` but in a slide-over panel.

Check if Sheet component exists: `frontend/src/components/ui/sheet.tsx`. If not, install it:
```bash
cd frontend && npx shadcn@latest add sheet
```

The hamburger icon should be a simple 3-line SVG. The sheet opens from the left, contains the full sidebar nav, and closes on nav item click.

**Step 2: Update Topbar to include MobileNav**

Import and render `MobileNav` in the topbar, visible only below `lg` breakpoint:
```tsx
<div className="lg:hidden">
  <MobileNav />
</div>
```

**Step 3: Verify build**

Run: `cd frontend && npm run build`
Expected: PASS

**Step 4: Commit**

```bash
git add frontend/src/components/mobile-nav.tsx frontend/src/components/topbar.tsx
git commit -m "feat: add MobileNav hamburger sheet for responsive"
```

---

## Task 9: App route group layout

Create the `(app)/layout.tsx` that wraps Dashboard, Classify, and History with the Sidebar + Topbar.

**Files:**
- Create: `frontend/src/app/(app)/layout.tsx`

**Step 1: Create the layout**

```tsx
import { Sidebar } from "@/components/sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-dvh relative z-[1]"
      style={{
        background: `
          radial-gradient(ellipse 60% 45% at 10% 0%, rgba(45,212,160,0.02) 0%, transparent 55%),
          radial-gradient(ellipse 40% 35% at 90% 100%, rgba(45,212,160,0.012) 0%, transparent 45%)
        `,
      }}
    >
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
```

**Step 2: Verify build**

Run: `cd frontend && npm run build`
Expected: PASS (no pages in route group yet, but layout compiles)

**Step 3: Commit**

```bash
git add frontend/src/app/\(app\)/layout.tsx
git commit -m "feat: add (app) route group layout with sidebar"
```

---

## Task 10: Update existing components for new tokens

Before creating pages, update the components that will be reused.

**Files:**
- Modify: `frontend/src/components/emails-table.tsx`
- Modify: `frontend/src/components/donut-chart.tsx`
- Modify: `frontend/src/components/line-chart.tsx`
- Modify: `frontend/src/components/result-card.tsx`
- Modify: `frontend/src/components/batch-results.tsx`
- Modify: `frontend/src/hooks/use-backend-health.ts`

**Step 1: emails-table.tsx**

1. Replace `labelStyles` object with `Stamp` component import
2. Replace confidence percentage text with `CertaintyRing` component
3. In the table body, replace `<span className={cn("... rounded-full border", labelStyles[label])}>{label}</span>` with `<Stamp label={label} />`
4. Replace confidence display with `<CertaintyRing confidence={Math.round(confidence * 100)} />`
5. Update the detail dialog to also use Stamp and CertaintyRing
6. Update date format to short form: `"20 mar"` style using `.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })`
7. Fix accent on "Confiança" in table header

**Step 2: donut-chart.tsx**

Replace Recharts PieChart with a custom SVG donut:
1. Remove all Recharts imports
2. Calculate `stroke-dasharray` for Produtivo and Improdutivo arcs
3. Use `viewBox="0 0 120 120"`, radius 46, stroke-width 9
4. Colors: `var(--stamp-approved)` and `var(--stamp-rejected)`
5. Center text: total count + "total" label
6. Legend: dot + label + count, right-aligned

**Step 3: line-chart.tsx**

1. Replace hardcoded `#34d399` with `var(--stamp-approved)` where Recharts accepts CSS (it does for stroke in newer versions). If Recharts doesn't accept CSS vars for `stroke`, use the hex value `#2dd4a0` directly.
2. Add a `<defs><linearGradient>` for the area fill under the line
3. Add `<Area>` component from Recharts with the gradient fill, opacity 0.1 to 0
4. Add period tabs state (7d/30d/90d) — filter `data` prop by slicing to last N entries

**Step 4: result-card.tsx**

1. Import `CertaintyRing` and `Stamp`
2. Replace `getConfidenceColor` function with `CertaintyRing` usage
3. Replace label badge rendering with `Stamp`
4. Update Card styling to use new border/background tokens

**Step 5: batch-results.tsx**

1. Replace `LABEL_STYLES` object with `Stamp` component
2. Replace hardcoded `text-green-600 dark:text-green-400` with `style={{ color: 'var(--stamp-approved)' }}`
3. Replace hardcoded `text-red-600 dark:text-red-400` with `style={{ color: 'var(--stamp-rejected)' }}`

**Step 6: use-backend-health.ts**

Add latency measurement by timing the fetch:

```tsx
async function checkHealth(): Promise<{ status: string; latencyMs: number }> {
  const start = performance.now()
  const res = await fetch(`${API}/api/health`)
  const latencyMs = Math.round(performance.now() - start)
  const data = await res.json()
  return { ...data, latencyMs }
}
```

Update the return type accordingly.

**Step 7: Verify build**

Run: `cd frontend && npm run build`
Expected: PASS

**Step 8: Commit**

```bash
git add frontend/src/components/emails-table.tsx frontend/src/components/donut-chart.tsx \
  frontend/src/components/line-chart.tsx frontend/src/components/result-card.tsx \
  frontend/src/components/batch-results.tsx frontend/src/hooks/use-backend-health.ts
git commit -m "feat: migrate components to product tokens, Stamp, and CertaintyRing"
```

---

## Task 11: Dashboard page

Create the main dashboard page inside the route group.

**Files:**
- Create: `frontend/src/app/(app)/dashboard/page.tsx`

**Step 1: Create the page**

This page assembles: Topbar + MetricsStrip + Charts (LineChart + DonutChart) + EmailsTable.

It's a `"use client"` page that uses:
- `useMetrics()` for metrics data
- `useEmails(page)` for the table
- `useSeed()` for the seed button in the topbar

Structure (from v4 mockup):
1. `<Topbar title="Visão geral" pill="30 dias">` with seed button as child
2. `<div className="p-5 lg:p-6 space-y-4">` content wrapper
3. MetricsStrip (or skeleton)
4. Charts grid: `grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-2.5`
   - LineChart in a card wrapper
   - DonutChart in a card wrapper
5. EmailsTable (or skeleton)
6. Staggered fade-up animations using CSS custom property `--index`

Card wrapper for charts:
```tsx
<div
  className="rounded-[10px] p-4 transition-colors duration-150"
  style={{
    background: 'linear-gradient(160deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)',
    border: '1px solid var(--rule)',
  }}
>
```

**Step 2: Verify build**

Run: `cd frontend && npm run build`
Expected: PASS

**Step 3: Test manually**

Run: `cd frontend && npm run dev`
Navigate to `http://localhost:3000/dashboard`
Expected: Full dashboard renders with sidebar, metrics, charts, table

**Step 4: Commit**

```bash
git add frontend/src/app/\(app\)/dashboard/page.tsx
git commit -m "feat: add Dashboard page with metrics, charts, and table"
```

---

## Task 12: Classify page

Move classification UI into its own page.

**Files:**
- Create: `frontend/src/app/(app)/classify/page.tsx`

**Step 1: Create the page**

Extract the classify section from current `page.tsx` (lines ~116-178). This page renders:

1. `<Topbar title="Classificar" />`
2. Content area with max-width constraint: `max-w-2xl mx-auto`
3. Tab toggle: Individual | Lote (reuse existing tab pattern)
4. `EmailInput` component (single mode)
5. `ResultCard` below input (when result exists)
6. `BatchInput` + `BatchResults` (batch mode)

Uses hooks: `useClassify`, `useBatchClassify`, `useExtract`

State: `text`, `mode` (single|batch)

Card wrappers use new depth strategy (border-only):
```tsx
style={{
  background: 'linear-gradient(160deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)',
  border: '1px solid var(--rule)',
}}
```

**Step 2: Verify build**

Run: `cd frontend && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/app/\(app\)/classify/page.tsx
git commit -m "feat: add Classify page for email classification"
```

---

## Task 13: History page

Full paginated email table with detail dialog.

**Files:**
- Create: `frontend/src/app/(app)/history/page.tsx`

**Step 1: Create the page**

1. `<Topbar title="Histórico" />`
2. Content wrapper with padding
3. `EmailsTable` with full pagination
4. Uses `useEmails(page)` hook

This is the simplest page — it's just the Topbar + EmailsTable.

**Step 2: Verify build**

Run: `cd frontend && npm run build`
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/src/app/\(app\)/history/page.tsx
git commit -m "feat: add History page with paginated email table"
```

---

## Task 14: Simplify landing page

Reduce `page.tsx` to a landing/hero page that links to the dashboard.

**Files:**
- Modify: `frontend/src/app/page.tsx`

**Step 1: Simplify page.tsx**

Strip out everything except the hero content. The exact hero content depends on what exists — the spec says to keep "the marketing headline." If the current page has no distinct hero section (it's all dashboard), create a simple landing:

1. Remove all hook usage except `useBackendHealth` (for the warmup overlay)
2. Remove metrics, charts, table, classify sections
3. Keep the "AutoU" branding and add a CTA button linking to `/dashboard`
4. Keep `WarmupOverlay` for cold-start handling

The landing page should be a clean entry point:
- Title: "AutoU"
- Subtitle: "Classificador de emails com inteligência artificial"
- CTA button: "Acessar dashboard" → links to `/dashboard`
- Minimal styling, centered on page

**Step 2: Verify build**

Run: `cd frontend && npm run build`
Expected: PASS — all pages compile

**Step 3: Test all routes**

Run: `cd frontend && npm run dev`
- `/` → landing page with CTA
- `/dashboard` → full dashboard with sidebar
- `/classify` → classify page with sidebar
- `/history` → history page with sidebar

**Step 4: Commit**

```bash
git add frontend/src/app/page.tsx
git commit -m "feat: simplify landing page with CTA to dashboard"
```

---

## Task 15: Update remaining components for token consistency

Ensure all touched components use new tokens consistently.

**Files:**
- Modify: `frontend/src/components/email-input.tsx`
- Modify: `frontend/src/components/batch-input.tsx`
- Modify: `frontend/src/components/empty-state.tsx`
- Modify: `frontend/src/components/seed-button.tsx`

**Step 1: email-input.tsx**

Update Card usage — the component may need explicit styling overrides to match the new depth strategy. Replace any remaining `border-border` or `bg-card` classes that don't map well to the new token system. Fix accents in Portuguese text.

**Step 2: batch-input.tsx**

Same as email-input. Also fix "Maximo" → "Máximo" and "multiplos" → "múltiplos".

**Step 3: empty-state.tsx**

The component uses `bg-muted`, `text-foreground`, `text-muted-foreground` — these should work via the token mapping. Verify visually.

**Step 4: seed-button.tsx**

Minimal changes — the component uses shadcn Button with ghost variant, which inherits from tokens. May need to verify hover state colors.

**Step 5: Verify build**

Run: `cd frontend && npm run build`
Expected: PASS

**Step 6: Commit**

```bash
git add frontend/src/components/email-input.tsx frontend/src/components/batch-input.tsx \
  frontend/src/components/empty-state.tsx frontend/src/components/seed-button.tsx
git commit -m "fix: update remaining components for token consistency and PT-BR accents"
```

---

## Task 16: Responsive polish

Add responsive breakpoints to all new components.

**Files:**
- Modify: `frontend/src/app/(app)/layout.tsx`
- Modify: `frontend/src/components/topbar.tsx`
- Modify: `frontend/src/components/metrics-strip.tsx`
- Modify: `frontend/src/app/(app)/dashboard/page.tsx`

**Step 1: Layout responsiveness**

The `(app)/layout.tsx` already hides the sidebar below `lg` with `className="hidden lg:block"`. Verify this works.

**Step 2: Topbar responsiveness**

- Below `lg`: show hamburger (MobileNav), reduce padding to 16px
- Action buttons: on mobile, keep only essential (seed), move others to overflow

**Step 3: MetricsStrip responsiveness**

The grid already uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`. Verify the 1px gap technique works across breakpoints.

**Step 4: Dashboard charts responsiveness**

Charts grid: `grid-cols-1 lg:grid-cols-[1.55fr_1fr]` — already responsive. Line chart goes full-width on mobile, donut below.

**Step 5: Verify on multiple breakpoints**

Open dev tools, test at:
- 1440px (desktop)
- 1024px (tablet landscape)
- 768px (tablet portrait)
- 375px (mobile)

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: responsive polish across all breakpoints"
```

---

## Task 17: Final verification and cleanup

Run full build, check all routes, clean up dead code.

**Files:**
- Verify all files
- Delete: `frontend/src/components/theme-provider.tsx` (if exists)

**Step 1: Delete dead files**

Check for and delete:
- `frontend/src/components/theme-provider.tsx` (no longer needed)
- Any unused imports in modified files

**Step 2: Full build**

Run: `cd frontend && npm run build`
Expected: PASS with no warnings

**Step 3: Visual verification**

Run: `cd frontend && npm run dev`
Check all routes render correctly:
- `/` — landing
- `/dashboard` — metrics, charts, table with new design
- `/classify` — classification forms
- `/history` — paginated table

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore: cleanup dead code and verify full build"
```

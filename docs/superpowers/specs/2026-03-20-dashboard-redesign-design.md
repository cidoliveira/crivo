# AutoU Dashboard Redesign — Design Spec

## Context

AutoU is an AI email classifier (Produtivo/Improdutivo) built as a job challenge. The current UI is a single-page vertical layout (`page.tsx`, 319 lines) containing: header bar, classify section (tabs for Individual/Lote), metrics cards, charts, and paginated history table — all stacked vertically.

The redesign targets a premium, product-grade dashboard that impresses evaluators in 10 seconds.

**Constraint:** The existing landing/hero experience at `/` stays. The user previously built a hero section with a marketing headline ("Classifique emails com inteligência artificial") which is kept as-is.

## Intent

**Who:** A tech lead at AutoU evaluating a take-home project. Opens the deployed URL on a 14" laptop between meetings.

**Task:** Paste an email, see it classify, glance at the dashboard, decide if this candidate ships production-grade work.

**Feel:** Like opening a real internal tool, not a demo. Professional, confident, quietly premium.

## Architecture: Sidebar + Pages

Replace the single-page vertical stack with a sidebar navigation layout. The landing page at `/` remains as the entry point (hero). The app pages share a sidebar layout via a route group.

### Pages

| Route | Content |
|-------|---------|
| `/` | Landing/hero page (unchanged — existing `page.tsx` content above the classify section) |
| `/dashboard` | Metrics strip, charts, recent emails table |
| `/classify` | Single + batch classification forms (current EmailInput, BatchInput, ResultCard, BatchResults) |
| `/history` | Full paginated email table with detail dialog |

### Route Group Structure

```
frontend/src/app/
├── page.tsx              — landing/hero (simplified, links to /dashboard)
├── layout.tsx            — root layout (Geist font, providers, toaster)
├── globals.css           — token system + texture layer
└── (app)/
    ├── layout.tsx        — sidebar + topbar wrapper (shared by dashboard/classify/history)
    ├── dashboard/
    │   └── page.tsx
    ├── classify/
    │   └── page.tsx
    └── history/
        └── page.tsx
```

### Sidebar (228px)

- **Same background as content** — transparent, separated by 1px `var(--rule)` border only
- **Wordmark** — clean text `AutoU | Workspace`, no logo box, no initials in colored square
- **Command-K search** — visual-only trigger with `⌘K` hint (non-functional placeholder in v1, can be wired later)
- **Nav items** — icon + label using `next/link`, active state via `usePathname()` matching route prefix
- **Active state** — subtle background (`rgba(255,255,255,0.05)`), no colored borders or indicators
- **Divider** — 1px line between primary nav (Visão geral, Classificar, Histórico) and secondary (Lote, Atividade)
- **Footer** — API status dot + latency display. Latency is computed client-side by timing the `useBackendHealth` fetch round-trip
- **Mobile** — collapses to hamburger icon in top bar, opens as a Sheet (shadcn) slide-over

### Top Bar (sticky)

- Page title + context pill (e.g., "30 dias")
- Action buttons (Seed, options)
- Blur backdrop: `background: rgba(10,10,11,0.88); backdrop-filter: blur(14px)`

## Design Tokens

Dark-mode only. This redesign removes the light theme entirely. Replace the existing `:root` / `.dark` dual-theme in `globals.css` with a single token set. The existing shadcn tokens (`--background`, `--foreground`, etc.) are replaced by product-world tokens:

```
/* Surfaces */
--void: #0a0a0b          /* base canvas */
--paper: #111113          /* elevated surface */
--paper-raised: #161618  /* dropdown/overlay */
--paper-hover: rgba(255,255,255,0.035)

/* Text — 4 levels */
--ink: #ececee            /* primary */
--ink-secondary: #9d9da6  /* supporting */
--ink-tertiary: #5c5c66   /* metadata */
--ink-ghost: #38383f      /* disabled/faint */

/* Borders — 2 levels */
--rule: rgba(255,255,255,0.055)
--rule-strong: rgba(255,255,255,0.09)

/* Semantic — stamps, not badges */
--stamp-approved: #2dd4a0
--stamp-approved-dim: rgba(45,212,160,0.08)
--stamp-approved-border: rgba(45,212,160,0.14)
--stamp-rejected: #e06c6c
--stamp-rejected-dim: rgba(224,108,108,0.08)
--stamp-rejected-border: rgba(224,108,108,0.14)

/* Confidence — intentionally same values as stamps now, separate tokens for future divergence */
--certainty-high: #2dd4a0
--certainty-mid: #c9a227
--certainty-low: #e06c6c
```

Note: Remove `next-themes` ThemeProvider and theme toggle. The app is dark-only.

## Typography

- **Font:** Geist Sans variable (headings, UI) + Geist Mono (data, dates, percentages). Geist is loaded via `next/font` as a variable font supporting weights 100-900, so intermediate weights (450, 550) render correctly.
- **Hierarchy:** weight + tracking, not just size
  - Page titles: 13px / 600 / -0.2 tracking
  - Card titles: 12px / 550
  - Labels: 11px / 500
  - Data values: 24px / 700 / -1 tracking / tabular-nums
  - Table body: 13px / 450
- **Percentage units** rendered as separate `<span>` at smaller size/weight (14px / 500)

## Depth Strategy: Borders Only

- No box-shadows on cards
- Cards use 1px `var(--rule)` border + subtle gradient background (`rgba(255,255,255,0.022)` to `0.004`, 160deg)
- Hover: border shifts to `var(--rule-strong)`
- Metrics strip: unified panel with 1px dividers (no separate cards)

## Texture Layer

Always-on (no toggle class needed in production — the rollback is simply removing these CSS rules):

- **Noise overlay:** `body::before` with inline SVG `feTurbulence` filter (`type="fractalNoise"`, `baseFrequency="0.85"`, `numOctaves="4"`, `stitchTiles="stitch"`), opacity 0.022, `position: fixed; inset: 0; pointer-events: none; z-index: 0`
- **Ambient gradients:** on the `.app` wrapper — two radial emerald glows (`rgba(45,212,160,0.02)` at top-left, `rgba(45,212,160,0.012)` at bottom-right)
- **Card gradients:** `linear-gradient(160deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)`

## Signature Element: Confidence Gauge

Replace the current thin `confidence-bar` (48px wide, 4px tall div) with a mini radial ring (28x28px SVG using `stroke-dasharray`):

- Ring fills proportionally to the confidence percentage
- Color tiers: >= 80% uses `--certainty-high`, 60-79% uses `--certainty-mid`, < 60% uses `--certainty-low`
- Paired with monospace percentage text to the right
- This appears in: emails table, result card, detail dialog

## Category Display: Stamps

Replace the current pill badges (`LABEL_STYLES` with `bg-emerald-500/10 ... rounded-full border`) with dot + text:

- 6px colored dot (with subtle glow via `box-shadow`) + text in the same color
- No background, no border — less visual noise
- Applied in: emails table, batch results, result card, detail dialog

## Metrics: Unified Strip

Replace the current 4 separate `MetricCard` components with a single grid panel:

- `display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--rule)`
- Each cell has `background: var(--void)`, rounded outer corners only
- Hover: cell background shifts to `rgba(255,255,255,0.012)`
- Delta indicators (e.g., `+12 esta semana`): computed client-side from `daily_series` — sum the last 7 entries for weekly delta, compare current vs previous period for percentage change
- No arrow icons for deltas, just colored text

## Charts

### Line Chart (volume over time)
- Keep Recharts but update colors to use token values (`#2dd4a0` for stroke, gradient fill from 0.1 to 0 opacity)
- Grid lines at 0.02 opacity
- Axis labels in Geist Mono
- Period tabs (7d / 30d / 90d): client-side filtering — slice `daily_series` array to last N entries. Backend already returns the full date range.

### Donut Chart (distribuição)
- Replace Recharts PieChart with a custom SVG circle using `stroke-dasharray` technique
- 120x120px viewBox, 46px radius, 9px stroke width, rounded linecaps
- Center: total count (22px/700 weight) + "total" label (9px, ghost color)
- Legend beside donut: dot + name + value, right-aligned numbers

## Table

- Rounded container with gradient background
- Header row: `var(--ink-ghost)` color, 11px, 0.2 letter-spacing
- Row hover: `rgba(255,255,255,0.018)` background
- Columns: Email (truncated, 280px max) | Categoria (stamp) | Confiança (ring gauge) | Sugestão (truncated, ghost) | Data (mono, short format "20 mar")
- Pagination: 24px square buttons, current state via stronger background + border

## Responsive — Mobile

### Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| `>= 1024px` | Full sidebar (228px) + content layout |
| `768-1023px` | Sidebar hidden, hamburger in topbar |
| `< 768px` | Hamburger + sheet overlay, fully stacked content |

### Mobile Adaptations

- **Sidebar** collapses entirely below 1024px. Hamburger icon in topbar opens a `Sheet` (shadcn) with the full nav
- **Metrics** stack to `grid-cols-2` on tablet, `grid-cols-1` on mobile (same unified panel, just reflowed)
- **Charts** stack vertically (`grid-cols-1`), line chart full width above donut
- **Table** keeps table layout on tablet, becomes a card list on mobile with stamp + confidence inline
- **Top bar** keeps page title + hamburger, seed/options move to a dropdown menu
- **Padding** reduces from 24px to 16px on mobile
- **Content max-width:** none — fills available space within the sidebar layout

## Animation

- Transitions: 100-150ms, ease-out
- Page entry: staggered fade-up (`animation-delay: calc(var(--index) * 60ms)`) — reuse existing `animate-fade-up` keyframes
- No spring/bounce effects
- Hover states: background-color and border-color transition only

## States

- **Loading:** Skeleton placeholders matching layout shapes (reuse existing `Skeleton` shadcn component)
- **Empty:** Existing `EmptyState` component, updated to match new token system
- **Error:** Inline messages, no alerts
- **Backend cold start:** Existing `WarmupOverlay`, updated to match new tokens

## Files to Change

### New Files
- `frontend/src/app/(app)/layout.tsx` — sidebar + topbar wrapper for app pages
- `frontend/src/app/(app)/dashboard/page.tsx` — dashboard view
- `frontend/src/app/(app)/classify/page.tsx` — classify view
- `frontend/src/app/(app)/history/page.tsx` — history view
- `frontend/src/components/sidebar.tsx` — sidebar navigation (uses `next/link` + `usePathname`)
- `frontend/src/components/topbar.tsx` — sticky top bar
- `frontend/src/components/certainty-ring.tsx` — signature confidence gauge SVG
- `frontend/src/components/stamp.tsx` — category dot + text indicator
- `frontend/src/components/metrics-strip.tsx` — unified metrics panel
- `frontend/src/components/mobile-nav.tsx` — hamburger button + Sheet with nav

### Modified Files
- `frontend/src/app/globals.css` — replace dual-theme tokens with single dark token system, add texture layer
- `frontend/src/app/layout.tsx` — remove ThemeProvider, keep Geist font + QueryClientProvider + Toaster
- `frontend/src/app/page.tsx` — simplify to landing/hero with link to `/dashboard`
- `frontend/src/components/emails-table.tsx` — replace pill badges with Stamp, replace confidence bar with CertaintyRing, update hardcoded colors to token values
- `frontend/src/components/donut-chart.tsx` — replace Recharts PieChart with custom SVG donut, update colors to tokens
- `frontend/src/components/line-chart.tsx` — update Recharts colors to token values, add gradient fill, add period tabs
- `frontend/src/components/result-card.tsx` — integrate CertaintyRing, replace badge with Stamp
- `frontend/src/components/metric-card.tsx` — refactor into metric cell (used inside metrics-strip)
- `frontend/src/components/email-input.tsx` — update Card usage to match new depth strategy (border-only, no shadow)
- `frontend/src/components/batch-input.tsx` — update Card usage to match new depth strategy
- `frontend/src/components/batch-results.tsx` — replace pill badges with Stamp pattern
- `frontend/src/components/empty-state.tsx` — update colors to new token system
- `frontend/src/components/seed-button.tsx` — moves into topbar, update styling
- `frontend/src/components/providers.tsx` — remove ThemeProvider wrapper, keep QueryClientProvider
- `frontend/src/hooks/use-backend-health.ts` — add latency measurement (time the fetch round-trip)

### Unchanged
- All backend files (no API changes needed)
- `frontend/src/hooks/use-classify.ts`
- `frontend/src/hooks/use-batch-classify.ts`
- `frontend/src/hooks/use-metrics.ts`
- `frontend/src/hooks/use-emails.ts`
- `frontend/src/hooks/use-extract.ts`
- `frontend/src/hooks/use-seed.ts`
- `frontend/src/components/warmup-overlay.tsx` (visual update only via token inheritance)
- `frontend/src/components/drop-zone.tsx`
- `frontend/src/lib/utils.ts`

## Reference

Visual mockups in `.superpowers/brainstorm/8777-1774047330/`:
- `premium-dashboard-v4.html` — approved direction (product tokens + signature confidence)
- `premium-dashboard-v3.html` — sidebar evolution
- `premium-dashboard-v2.html` — texture exploration

"use client"

import { useState } from "react"
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface DailyPoint {
  day: string
  count: number
}

interface ClassificationsLineChartProps {
  data: DailyPoint[]
}

function formatDay(day: string): string {
  // Append T00:00:00 to force local-time parsing (prevents UTC shift)
  const date = new Date(`${day}T00:00:00`)
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

export function ClassificationsLineChart({ data }: ClassificationsLineChartProps) {
  const [period, setPeriod] = useState<7 | 30 | 90>(30)
  const filtered = data.slice(-period)

  return (
    <div>
      {/* Period tabs */}
      <div className="flex mb-3" style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 5, padding: 2, gap: 1, display: 'inline-flex' }}>
        {([7, 30, 90] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className="text-[10px] font-medium"
            style={{
              padding: '2px 8px', borderRadius: 3, cursor: 'pointer', border: 'none',
              background: period === p ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: period === p ? 'var(--ink-secondary)' : 'var(--ink-ghost)',
            }}>
            {p}d
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={filtered} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2dd4a0" stopOpacity={0.1} />
              <stop offset="100%" stopColor="#2dd4a0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
          <XAxis dataKey="day" tickFormatter={formatDay}
            tick={{ fontSize: 9, fill: 'var(--ink-ghost)' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.02)' }}
            tickLine={false} />
          <YAxis allowDecimals={false}
            tick={{ fontSize: 9, fill: 'var(--ink-ghost)' }}
            axisLine={false} tickLine={false} />
          <Tooltip labelFormatter={(label) => formatDay(String(label))}
            contentStyle={{
              background: 'var(--paper-raised)',
              border: '1px solid var(--rule)',
              borderRadius: 8,
              color: 'var(--ink)',
              fontSize: 12,
            }} />
          <Area type="monotone" dataKey="count" fill="url(#lineGradient)" stroke="none" />
          <Line type="monotone" dataKey="count" stroke="#2dd4a0" strokeWidth={2}
            dot={{ fill: '#2dd4a0', r: 2, strokeWidth: 0 }}
            activeDot={{ fill: '#2dd4a0', r: 4, strokeWidth: 2, stroke: 'var(--paper)' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

"use client"

import {
  LineChart,
  Line,
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
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="day"
          tickFormatter={formatDay}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={{ stroke: "var(--color-border)" }}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={{ stroke: "var(--color-border)" }}
        />
        <Tooltip
          labelFormatter={(label) => formatDay(String(label))}
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            color: "var(--color-foreground)",
            fontSize: "12px",
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#34d399"
          strokeWidth={2}
          dot={{ fill: "#34d399", r: 2.5, strokeWidth: 0 }}
          activeDot={{ fill: "#34d399", r: 4, strokeWidth: 2, stroke: "var(--color-card)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

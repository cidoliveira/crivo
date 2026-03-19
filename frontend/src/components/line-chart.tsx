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
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickFormatter={formatDay}
          tick={{ fontSize: 11 }}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip
          labelFormatter={(label) => formatDay(String(label))}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

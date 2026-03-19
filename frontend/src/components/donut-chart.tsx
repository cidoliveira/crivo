"use client"

import {
  PieChart,
  Pie,
  Cell,
  Label,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

interface DonutChartProps {
  produtivo: number
  improdutivo: number
}

const COLORS: Record<string, string> = {
  Produtivo: "#22c55e",
  Improdutivo: "#ef4444",
}

interface LabelViewBox {
  cx?: number
  cy?: number
}

function CenterLabel({
  viewBox,
  total,
}: {
  viewBox?: LabelViewBox
  total: number
}) {
  const cx = viewBox?.cx ?? 0
  const cy = viewBox?.cy ?? 0
  return (
    <>
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground"
        style={{ fontSize: 24, fontWeight: 700 }}
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: 12, fill: "#888" }}
      >
        Total
      </text>
    </>
  )
}

export function DonutChart({ produtivo, improdutivo }: DonutChartProps) {
  const data = [
    { name: "Produtivo", value: produtivo },
    { name: "Improdutivo", value: improdutivo },
  ]
  const total = produtivo + improdutivo

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          innerRadius={60}
          outerRadius={90}
          dataKey="value"
          cx="50%"
          cy="50%"
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={COLORS[entry.name]}
            />
          ))}
          <Label
            content={({ viewBox }) => (
              <CenterLabel viewBox={viewBox as LabelViewBox} total={total} />
            )}
          />
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

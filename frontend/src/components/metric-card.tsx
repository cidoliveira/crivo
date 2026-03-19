import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
}

export function MetricCard({ label, value, sub, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm text-muted-foreground font-normal">
            {label}
          </CardTitle>
          {icon && (
            <span className="text-muted-foreground">{icon}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        {sub && (
          <div className="text-xs text-muted-foreground mt-1">{sub}</div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ClassifyResponse } from "@/hooks/use-classify"

interface ResultCardProps {
  result: ClassifyResponse
  onReset: () => void
}

function getConfidenceColor(pct: number): {
  badgeClass: string
  barClass: string
} {
  if (pct >= 85) {
    return {
      badgeClass: "bg-green-500/90 text-white",
      barClass: "bg-green-500",
    }
  }
  if (pct >= 60) {
    return {
      badgeClass: "bg-yellow-500/90 text-white",
      barClass: "bg-yellow-500",
    }
  }
  return {
    badgeClass: "bg-red-500/90 text-white",
    barClass: "bg-red-500",
  }
}

export function ResultCard({ result, onReset }: ResultCardProps) {
  const pct = Math.round(result.confidence * 100)
  const { badgeClass, barClass } = getConfidenceColor(pct)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Resultado da Classificacao
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Label badge */}
          <div>
            <span
              className={cn(
                "inline-block rounded-full px-3 py-1 text-sm font-medium",
                badgeClass
              )}
            >
              {result.label}
            </span>
          </div>

          {/* Confidence bar */}
          <div className="flex items-center gap-3">
            <div className="h-2.5 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", barClass)}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-medium tabular-nums w-10 text-right">
              {pct}%
            </span>
          </div>

          {/* Explanation */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.explanation}
          </p>

          {/* Metadata */}
          <p className="text-xs text-muted-foreground/70">
            Tempo de inferencia: {result.inference_ms}ms
          </p>

          {/* Reset button */}
          <div>
            <Button variant="outline" size="sm" onClick={onReset}>
              Nova classificacao
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

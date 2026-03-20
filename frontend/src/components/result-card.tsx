"use client"

import { useState, useCallback } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { Copy, Check } from "lucide-react"
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
      badgeClass: "bg-emerald-500/90 text-white",
      barClass: "bg-emerald-500",
    }
  }
  if (pct >= 60) {
    return {
      badgeClass: "bg-amber-500/90 text-white",
      barClass: "bg-amber-500",
    }
  }
  return {
    badgeClass: "bg-red-400/90 text-white",
    barClass: "bg-red-400",
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silently fail in insecure contexts
    }
  }, [text])

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={copied ? "Copiado" : "Copiar resposta"}
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )
}

export function ResultCard({ result, onReset }: ResultCardProps) {
  const pct = Math.round(result.confidence * 100)
  const { badgeClass, barClass } = getConfidenceColor(pct)
  const [suggestionText, setSuggestionText] = useState(result.suggestion)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Resultado da Classificação
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

          {/* Response suggestion */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Sugestão de Resposta
              </span>
              <CopyButton text={suggestionText} />
            </div>
            <TextareaAutosize
              value={suggestionText}
              onChange={(e) => setSuggestionText(e.target.value)}
              minRows={4}
              maxRows={12}
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Metadata */}
          <p className="text-xs text-muted-foreground/70">
            Tempo de inferência: {result.inference_ms}ms
          </p>

          {/* Reset button */}
          <div>
            <Button variant="outline" size="sm" onClick={onReset}>
              Nova classificação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

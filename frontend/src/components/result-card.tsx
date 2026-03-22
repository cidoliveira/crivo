"use client"

import { useState, useCallback } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { Copy, Check, AlertTriangle } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ClassifyResponse } from "@/hooks/use-classify"
import { CertaintyRing } from "./certainty-ring"
import { Stamp } from "./stamp"

interface ResultCardProps {
  result: ClassifyResponse
  onReset: () => void
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
            <Stamp label={result.label as "Produtivo" | "Improdutivo"} />
          </div>

          {/* Confidence */}
          <div className="flex items-center gap-3">
            <CertaintyRing confidence={pct} />
          </div>

          {/* Explanation */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.explanation}
          </p>

          {/* Response suggestion or internal action */}
          <div className="flex flex-col gap-2">
            {result.no_reply && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  Este email é automático e não aceita respostas diretas
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {result.no_reply ? "Ação Interna Sugerida" : "Sugestão de Resposta"}
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

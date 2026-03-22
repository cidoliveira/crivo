"use client"
import { useState, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { BACKEND_URL } from "@/lib/api"

export interface BatchItemResult {
  index: number
  total: number
  email_id: string
  classification_id: string
  label: string
  confidence: number
  suggestion: string
  no_reply: boolean
  inference_ms: number
  error: string | null
}

export interface BatchSummary {
  total: number
  successful: number
  failed: number
  avg_confidence: number
  by_label: Record<string, number>
}

export type BatchStatus = "idle" | "extracting" | "running" | "complete" | "error"

export function useBatchClassify() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<BatchStatus>("idle")
  const [items, setItems] = useState<BatchItemResult[]>([])
  const [summary, setSummary] = useState<BatchSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  async function _runStream(texts: string[]) {
    const batchId = crypto.randomUUID()
    abortRef.current = new AbortController()
    setStatus("running")
    setItems([])
    setSummary(null)
    setError(null)

    const res = await fetch(`${BACKEND_URL}/api/classify/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, batch_id: batchId }),
      signal: abortRef.current.signal,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Erro ao processar lote" }))
      throw new Error(err.detail ?? "Erro ao processar lote")
    }

    const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += value
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue
        const raw = line.slice(6).trim()
        if (!raw) continue
        try {
          const payload = JSON.parse(raw)
          if (payload.type === "progress" && payload.item) {
            setItems((prev) => [...prev, payload.item as BatchItemResult])
          } else if (payload.type === "complete") {
            setSummary(payload.summary as BatchSummary)
            setStatus("complete")
            queryClient.invalidateQueries({ queryKey: ["metrics"] })
            queryClient.invalidateQueries({ queryKey: ["emails"] })
            toast.success(`Lote concluido: ${(payload.summary as BatchSummary).successful} emails classificados`)
          }
        } catch {
          // ignore malformed SSE lines
        }
      }
    }
  }

  async function runBatchFromTexts(texts: string[]) {
    abortRef.current = new AbortController()
    setStatus("running")
    setItems([])
    setSummary(null)
    setError(null)
    try {
      await _runStream(texts)
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      toast.error("Erro ao processar lote", { description: (err as Error).message })
      setError((err as Error).message ?? "Erro desconhecido")
      setStatus("error")
    }
  }

  async function runBatchFromFiles(files: File[]) {
    abortRef.current = new AbortController()
    setStatus("extracting")
    setItems([])
    setSummary(null)
    setError(null)
    try {
      const texts: string[] = []
      for (const file of files) {
        const form = new FormData()
        form.append("file", file)
        const res = await fetch(`${BACKEND_URL}/api/extract`, {
          method: "POST",
          body: form,
          signal: abortRef.current.signal,
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: file.name }))
          throw new Error(`${file.name}: ${err.detail}`)
        }
        const data = await res.json()
        texts.push(data.text as string)
      }
      await _runStream(texts)
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      toast.error("Erro ao processar lote", { description: (err as Error).message })
      setError((err as Error).message ?? "Erro desconhecido")
      setStatus("error")
    }
  }

  function cancel() {
    abortRef.current?.abort()
    setStatus("idle")
  }

  function reset() {
    abortRef.current?.abort()
    setStatus("idle")
    setItems([])
    setSummary(null)
    setError(null)
  }

  return {
    status,
    items,
    summary,
    error,
    runBatchFromTexts,
    runBatchFromFiles,
    cancel,
    reset,
  }
}

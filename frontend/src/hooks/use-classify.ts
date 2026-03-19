"use client"

import { useMutation } from "@tanstack/react-query"
import { BACKEND_URL } from "@/lib/api"

export interface ClassifyResponse {
  email_id: string
  classification_id: string
  label: "Produtivo" | "Improdutivo"
  confidence: number
  explanation: string
  suggestion: string
  inference_ms: number
}

async function classifyEmail(text: string): Promise<ClassifyResponse> {
  const res = await fetch(`${BACKEND_URL}/api/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erro ao classificar o email" }))
    throw new Error(err.detail ?? "Erro ao classificar o email")
  }

  return res.json()
}

export function useClassify() {
  return useMutation({ mutationFn: classifyEmail })
}

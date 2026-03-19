"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: classifyEmail,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] })
      queryClient.invalidateQueries({ queryKey: ["emails"] })
      toast.success("Email classificado com sucesso", {
        description: `Categoria: ${data.label}`,
      })
    },
    onError: (error: Error) => {
      toast.error("Erro ao classificar o email", {
        description: error.message,
      })
    },
  })
}

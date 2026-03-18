"use client"

import { useMutation } from "@tanstack/react-query"
import { BACKEND_URL } from "@/lib/api"

export interface ExtractResponse {
  text: string
  char_count: number
  filename: string
}

async function extractFile(file: File): Promise<ExtractResponse> {
  const form = new FormData()
  form.append("file", file)

  const res = await fetch(`${BACKEND_URL}/api/extract`, {
    method: "POST",
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erro ao extrair texto" }))
    throw new Error(err.detail ?? "Erro ao extrair texto")
  }

  return res.json()
}

export function useExtract() {
  return useMutation({ mutationFn: extractFile })
}

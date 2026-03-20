"use client"

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { BACKEND_URL } from "@/lib/api"

export interface EmailRow {
  id: string
  subject: string
  body_preview: string
  body_text: string
  label: string
  confidence: number
  suggestion: string | null
  created_at: string
}

export interface EmailsData {
  items: EmailRow[]
  total: number
  page: number
  page_size: number
}

async function fetchEmails(page: number, pageSize: number): Promise<EmailsData> {
  const res = await fetch(
    `${BACKEND_URL}/api/emails?page=${page}&page_size=${pageSize}`
  )
  if (!res.ok) {
    throw new Error("Erro ao carregar emails")
  }
  return res.json()
}

export function useEmails(page: number, pageSize = 10) {
  return useQuery({
    queryKey: ["emails", page, pageSize],
    queryFn: () => fetchEmails(page, pageSize),
    placeholderData: keepPreviousData,
  })
}

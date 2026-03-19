"use client"

import { useQuery } from "@tanstack/react-query"
import { BACKEND_URL } from "@/lib/api"

export interface DailyPoint {
  day: string
  count: number
}

export interface MetricsData {
  total: number
  by_label: Record<string, number>
  avg_confidence: number
  daily_series: DailyPoint[]
}

async function fetchMetrics(): Promise<MetricsData> {
  const res = await fetch(`${BACKEND_URL}/api/metrics`)
  if (!res.ok) {
    throw new Error("Erro ao carregar metricas")
  }
  return res.json()
}

export function useMetrics() {
  return useQuery({
    queryKey: ["metrics"],
    queryFn: fetchMetrics,
    staleTime: 30_000,
  })
}

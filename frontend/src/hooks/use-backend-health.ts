import { useQuery } from "@tanstack/react-query"
import { BACKEND_URL } from "@/lib/api"

async function checkHealth(): Promise<{ status: string; latencyMs: number }> {
  const start = performance.now()
  const res = await fetch(`${BACKEND_URL}/api/health`)
  const latencyMs = Math.round(performance.now() - start)
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`)
  }
  const data = await res.json()
  return { ...data, latencyMs }
}

export function useBackendHealth() {
  return useQuery({
    queryKey: ["backend-health"],
    queryFn: checkHealth,
    retry: true,
    retryDelay: (attempt) => Math.min(1000 * Math.pow(2, attempt + 1), 10_000),
    refetchInterval: (query) => (query.state.data ? false : 5_000),
    staleTime: Infinity,
  })
}

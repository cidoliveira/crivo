import { useQuery } from "@tanstack/react-query"
import { BACKEND_URL } from "@/lib/api"

async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${BACKEND_URL}/api/health`)
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`)
  }
  return res.json()
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

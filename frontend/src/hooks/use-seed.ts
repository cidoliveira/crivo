"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { BACKEND_URL } from "@/lib/api"

async function seedDemoData(): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/seed`, { method: "POST" })
  if (!res.ok) {
    throw new Error("Erro ao carregar dados demo")
  }
}

export function useSeed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: seedDemoData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] })
      queryClient.invalidateQueries({ queryKey: ["emails"] })
      toast.success("Dados demo carregados com sucesso!")
    },
    onError: () => {
      toast.error("Erro ao carregar dados demo.")
    },
  })
}

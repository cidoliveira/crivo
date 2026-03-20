"use client"

import { Button } from "@/components/ui/button"
import { useSeed } from "@/hooks/use-seed"

export function SeedButton() {
  const seed = useSeed()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => seed.mutate()}
      disabled={seed.isPending}
    >
      {seed.isPending ? "Carregando..." : "Carregar dados demo"}
    </Button>
  )
}

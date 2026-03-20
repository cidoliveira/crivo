"use client"

import { Button } from "@/components/ui/button"
import { useSeed } from "@/hooks/use-seed"

export function SeedButton() {
  const seed = useSeed()

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs text-muted-foreground hover:text-foreground"
      onClick={() => seed.mutate()}
      disabled={seed.isPending}
    >
      {seed.isPending ? "Carregando..." : "Dados demo"}
    </Button>
  )
}

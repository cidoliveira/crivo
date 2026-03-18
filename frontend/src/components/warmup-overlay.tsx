"use client"

import { useState, useEffect, useRef } from "react"
import { useBackendHealth } from "@/hooks/use-backend-health"
import { Button } from "@/components/ui/button"

const SLOW_MESSAGE_THRESHOLD_MS = 30_000

export function WarmupOverlay() {
  const { isSuccess } = useBackendHealth()
  const [elapsed, setElapsed] = useState(0)
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)
  const startRef = useRef(Date.now())

  // Track elapsed time using Date.now() to avoid drift under tab suspension
  useEffect(() => {
    if (isSuccess) return
    const id = setInterval(() => {
      setElapsed(Date.now() - startRef.current)
    }, 1000)
    return () => clearInterval(id)
  }, [isSuccess])

  // Fade out when backend responds
  useEffect(() => {
    if (!isSuccess) return
    setFading(true)
    const id = setTimeout(() => setVisible(false), 350)
    return () => clearTimeout(id)
  }, [isSuccess])

  if (!visible) return null

  const showSlowMessage = elapsed >= SLOW_MESSAGE_THRESHOLD_MS

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm transition-opacity duration-300"
      style={{ opacity: fading ? 0 : 1 }}
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-6 text-center">
        {/* CSS-only spinner */}
        <div
          className="size-10 rounded-full border-4 border-muted border-t-primary animate-spin"
          role="status"
          aria-label="Carregando"
        />

        <div className="flex flex-col items-center gap-2">
          <p className="text-base font-medium text-foreground">
            {showSlowMessage
              ? "Isso pode levar ate 1 minuto..."
              : "Conectando ao motor de IA..."}
          </p>
          <p className="text-sm text-muted-foreground">
            {showSlowMessage
              ? "O servidor esta iniciando. Aguarde ou tente novamente."
              : "Aguarde enquanto o servidor inicia"}
          </p>
        </div>

        {showSlowMessage && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        )}
      </div>
    </div>
  )
}

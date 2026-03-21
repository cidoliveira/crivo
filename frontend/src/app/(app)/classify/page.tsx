"use client"

import { useState } from "react"
import { Topbar } from "@/components/topbar"
import { EmailInput } from "@/components/email-input"
import { ResultCard } from "@/components/result-card"
import { BatchInput } from "@/components/batch-input"
import { BatchResults } from "@/components/batch-results"
import { useClassify } from "@/hooks/use-classify"
import { useBatchClassify } from "@/hooks/use-batch-classify"

export default function ClassifyPage() {
  const [text, setText] = useState("")
  const [mode, setMode] = useState<"single" | "batch">("single")

  const classify = useClassify()
  const batch = useBatchClassify()

  const handleClassify = () => {
    if (text.trim()) classify.mutate(text.trim())
  }
  const handleReset = () => {
    setText("")
    classify.reset()
  }

  return (
    <>
      <Topbar title="Classificar" />

      <div className="p-5 lg:p-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Tab toggle */}
          <div
            className="inline-flex"
            style={{
              background: "rgba(255,255,255,0.025)",
              borderRadius: 5,
              padding: 2,
              gap: 1,
            }}
          >
            <button
              onClick={() => setMode("single")}
              className="text-xs font-medium"
              style={{
                padding: "4px 12px",
                borderRadius: 3,
                cursor: "pointer",
                border: "none",
                background:
                  mode === "single"
                    ? "rgba(255,255,255,0.06)"
                    : "transparent",
                color:
                  mode === "single"
                    ? "var(--ink-secondary)"
                    : "var(--ink-ghost)",
              }}
            >
              Individual
            </button>
            <button
              onClick={() => setMode("batch")}
              className="text-xs font-medium"
              style={{
                padding: "4px 12px",
                borderRadius: 3,
                cursor: "pointer",
                border: "none",
                background:
                  mode === "batch"
                    ? "rgba(255,255,255,0.06)"
                    : "transparent",
                color:
                  mode === "batch"
                    ? "var(--ink-secondary)"
                    : "var(--ink-ghost)",
              }}
            >
              Lote
            </button>
          </div>

          {/* Single mode */}
          {mode === "single" && (
            <div className="space-y-4">
              <div
                className="rounded-[10px] overflow-hidden"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)",
                  border: "1px solid var(--rule)",
                }}
              >
                <EmailInput
                  text={text}
                  onTextChange={setText}
                  onClassify={handleClassify}
                  isClassifying={classify.isPending}
                  classifyError={
                    classify.isError ? classify.error.message : null
                  }
                />
              </div>

              {classify.isSuccess && classify.data && (
                <div
                  className="rounded-[10px] overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)",
                    border: "1px solid var(--rule)",
                  }}
                >
                  <ResultCard result={classify.data} onReset={handleReset} />
                </div>
              )}
            </div>
          )}

          {/* Batch mode */}
          {mode === "batch" && (
            <div className="space-y-4">
              {batch.status === "idle" && (
                <div
                  className="rounded-[10px] overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)",
                    border: "1px solid var(--rule)",
                  }}
                >
                  <BatchInput
                    onBatchFromTexts={batch.runBatchFromTexts}
                    onBatchFromFiles={batch.runBatchFromFiles}
                    isProcessing={batch.status !== "idle"}
                    status={batch.status}
                  />
                </div>
              )}

              {batch.status !== "idle" && (
                <div
                  className="rounded-[10px] overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)",
                    border: "1px solid var(--rule)",
                  }}
                >
                  <BatchResults
                    status={batch.status}
                    items={batch.items}
                    summary={batch.summary}
                    error={batch.error}
                    onCancel={batch.cancel}
                    onReset={batch.reset}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

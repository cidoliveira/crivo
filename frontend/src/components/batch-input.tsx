"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import TextareaAutosize from "react-textarea-autosize"
import { FileText, X, Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface BatchInputProps {
  onBatchFromTexts: (texts: string[]) => void
  onBatchFromFiles: (files: File[]) => void
  isProcessing: boolean
  status: string
}

export function BatchInput({
  onBatchFromTexts,
  onBatchFromFiles,
  isProcessing,
}: BatchInputProps) {
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [batchText, setBatchText] = useState("")

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    multiple: true,
    maxFiles: 20,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024,
    disabled: isProcessing,
    onDrop: (accepted) => {
      setFileError(null)
      if (files.length + accepted.length > 20) {
        setFileError("Máximo de 20 arquivos por lote.")
        return
      }
      setFiles((prev) => [...prev, ...accepted])
    },
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setFileError(null)
  }

  const handleSubmitFiles = () => {
    if (files.length === 0 || isProcessing) return
    onBatchFromFiles(files)
  }

  const splitTexts = batchText
    .replace(/\r\n/g, "\n")
    .split(/\n---\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  const splitCount = splitTexts.length

  const handleSubmitTexts = () => {
    if (splitCount === 0 || isProcessing) return
    onBatchFromTexts(splitTexts)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Classificação em Lote</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Section A — Multi-file dropzone */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Arquivos
          </p>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-border hover:border-primary/50 hover:bg-muted/30",
              isDragActive && !isDragReject && "border-primary bg-primary/5",
              isDragReject && "border-destructive bg-destructive/5",
              isProcessing && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            {isDragReject ? (
              <p className="text-sm text-destructive font-medium">
                Formato não suportado
              </p>
            ) : isDragActive ? (
              <p className="text-sm text-primary font-medium">
                Solte os arquivos aqui...
              </p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Arraste arquivos ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground/70">
                  .txt, .pdf — max 10 MB por arquivo, max 20 arquivos
                </p>
              </div>
            )}
          </div>

          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-sm"
                >
                  <FileText className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="max-w-[160px] truncate text-foreground">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    disabled={isProcessing}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10 disabled:cursor-not-allowed"
                    aria-label={`Remover ${file.name}`}
                  >
                    <X className="size-3 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {fileError && (
            <p className="text-sm text-destructive">{fileError}</p>
          )}

          <Button
            onClick={handleSubmitFiles}
            disabled={files.length === 0 || isProcessing}
            size="sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              `Classificar Lote (${files.length} arquivo${files.length !== 1 ? "s" : ""})`
            )}
          </Button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        {/* Section B — Delimiter text input */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Texto
          </p>
          <TextareaAutosize
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            disabled={isProcessing}
            minRows={5}
            placeholder="Cole múltiplos emails separados por ---"
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-xs text-muted-foreground">
            {splitCount} email(s) detectado(s)
          </p>
          <Button
            onClick={handleSubmitTexts}
            disabled={splitCount === 0 || isProcessing}
            size="sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              `Classificar Lote (${splitCount} email${splitCount !== 1 ? "s" : ""})`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

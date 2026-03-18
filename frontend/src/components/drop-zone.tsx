"use client"

import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { Upload, FileText, X } from "lucide-react"

interface DropZoneProps {
  onFileDrop: (file: File) => void
  isLoading?: boolean
  filename?: string | null
  onClearFile?: () => void
}

export function DropZone({
  onFileDrop,
  isLoading,
  filename,
  onClearFile,
}: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: {
        "text/plain": [".txt"],
        "application/pdf": [".pdf"],
      },
      maxFiles: 1,
      maxSize: 10 * 1024 * 1024,
      onDrop: (accepted) => {
        if (accepted[0]) onFileDrop(accepted[0])
      },
      disabled: isLoading,
    })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-border hover:border-primary/50 hover:bg-muted/30",
        isDragActive && !isDragReject && "border-primary bg-primary/5",
        isDragReject && "border-destructive bg-destructive/5",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />

      {isDragReject ? (
        <p className="text-sm text-destructive font-medium">
          Formato nao suportado
        </p>
      ) : isDragActive ? (
        <p className="text-sm text-primary font-medium">
          Solte o arquivo aqui...
        </p>
      ) : filename ? (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-sm">
            <FileText className="size-3.5 text-muted-foreground" />
            <span className="max-w-[200px] truncate text-foreground">
              {filename}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClearFile?.()
              }}
              className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
              aria-label="Remover arquivo"
            >
              <X className="size-3 text-muted-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Arraste outro arquivo para substituir
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Arraste um arquivo ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground/70">
            .txt, .pdf — max 10 MB
          </p>
        </div>
      )}
    </div>
  )
}

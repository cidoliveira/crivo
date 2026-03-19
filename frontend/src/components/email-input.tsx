"use client"

import { useState } from "react"
import { EmailTextarea } from "./text-area"
import { DropZone } from "./drop-zone"
import { useExtract } from "@/hooks/use-extract"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface EmailInputProps {
  text: string
  onTextChange: (text: string) => void
  onClassify: () => void
  isClassifying: boolean
  classifyError: string | null
}

export function EmailInput({
  text,
  onTextChange,
  onClassify,
  isClassifying,
  classifyError,
}: EmailInputProps) {
  const [filename, setFilename] = useState<string | null>(null)
  const extract = useExtract()

  const handleFileDrop = (file: File) => {
    extract.mutate(file, {
      onSuccess: (data) => {
        onTextChange(data.text)
        setFilename(data.filename)
      },
    })
  }

  const handleClearFile = () => {
    setFilename(null)
  }

  const canSubmit = text.trim().length > 0 && !extract.isPending && !isClassifying

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Classificar Email</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <EmailTextarea
          value={text}
          onChange={onTextChange}
          disabled={extract.isPending || isClassifying}
        />
        <DropZone
          onFileDrop={handleFileDrop}
          isLoading={extract.isPending || isClassifying}
          filename={filename}
          onClearFile={handleClearFile}
        />
        {extract.isError && (
          <p className="text-sm text-destructive">
            {extract.error.message}
          </p>
        )}
        {classifyError && (
          <p className="text-sm text-destructive">{classifyError}</p>
        )}
        <Button disabled={!canSubmit} onClick={onClassify} className="w-full">
          {isClassifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Classificando...
            </>
          ) : extract.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extraindo texto...
            </>
          ) : (
            "Classificar"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

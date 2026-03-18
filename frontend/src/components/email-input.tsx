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

export function EmailInput() {
  const [text, setText] = useState("")
  const [filename, setFilename] = useState<string | null>(null)
  const extract = useExtract()

  const handleFileDrop = (file: File) => {
    extract.mutate(file, {
      onSuccess: (data) => {
        setText(data.text)
        setFilename(data.filename)
      },
    })
  }

  const handleClearFile = () => {
    setFilename(null)
  }

  const canSubmit = text.trim().length > 0 && !extract.isPending

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Classificar Email</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <EmailTextarea
          value={text}
          onChange={setText}
          disabled={extract.isPending}
        />
        <DropZone
          onFileDrop={handleFileDrop}
          isLoading={extract.isPending}
          filename={filename}
          onClearFile={handleClearFile}
        />
        {extract.isError && (
          <p className="text-sm text-destructive">
            {extract.error.message}
          </p>
        )}
        <Button disabled={!canSubmit} className="w-full">
          {extract.isPending ? (
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

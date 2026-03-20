"use client"

import TextareaAutosize from "react-textarea-autosize"
import { cn } from "@/lib/utils"

interface EmailTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function EmailTextarea({
  value,
  onChange,
  placeholder = "Cole ou digite o conteúdo do e-mail aqui...",
  disabled,
}: EmailTextareaProps) {
  return (
    <TextareaAutosize
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      minRows={4}
      maxRows={20}
      className={cn(
        "w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      )}
    />
  )
}

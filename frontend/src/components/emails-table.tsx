"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Archive, Reply } from "lucide-react"
import { type EmailRow, type EmailsData } from "@/hooks/use-emails"
import { EmptyState } from "./empty-state"
import { Stamp } from "./stamp"
import { CertaintyRing } from "./certainty-ring"

interface EmailsTableProps {
  data: EmailsData
  page: number
  onPageChange: (page: number) => void
  onClassifyClick?: () => void
}

function truncate(text: string, max = 60): string {
  return text.length <= max ? text : text.slice(0, max) + "..."
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  })
}

export function EmailsTable({ data, page, onPageChange, onClassifyClick }: EmailsTableProps) {
  const totalPages = Math.ceil(data.total / data.page_size)
  const [selected, setSelected] = useState<EmailRow | null>(null)

  return (
    <>
      <div className="flex flex-col gap-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Email</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Confiança</TableHead>
              <TableHead className="w-[25%]">Sugestão</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-0 border-0">
                  <EmptyState
                    title="Nenhuma classificação ainda"
                    description="Classifique emails para ver o histórico aqui"
                    action={onClassifyClick ? {
                      label: "Classificar email",
                      onClick: onClassifyClick,
                    } : undefined}
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.items.map((row) => {
                const isNoReply = row.suggestion?.startsWith("Ação interna:") ?? false
                const suggestionPreview = row.suggestion
                  ? truncate(row.suggestion.split("\n")[0], 40)
                  : "\u2014"
                return (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelected(row)}
                  >
                    <TableCell className="max-w-0">
                      <span className="block truncate text-sm">
                        {truncate(row.body_preview, 60)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Stamp label={row.label as "Produtivo" | "Improdutivo"} />
                    </TableCell>
                    <TableCell>
                      <CertaintyRing confidence={Math.round(row.confidence * 100)} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-0">
                      <span className="flex items-center gap-1.5 truncate">
                        {isNoReply ? (
                          <Archive className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        ) : row.suggestion ? (
                          <Reply className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                        ) : null}
                        <span className="truncate">{suggestionPreview}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(row.created_at)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>

      {/* Email detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-semibold leading-snug">
                  {selected.subject || "Email sem assunto"}
                </DialogTitle>
                <div className="flex items-center gap-3 pt-1">
                  <Stamp label={selected.label as "Produtivo" | "Improdutivo"} />
                  <CertaintyRing confidence={Math.round(selected.confidence * 100)} />
                  <span className="text-xs" style={{ color: 'var(--ink-ghost)' }}>
                    confiança
                  </span>
                  <span className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>
                    {formatDate(selected.created_at)}
                  </span>
                </div>
              </DialogHeader>

              <div className="flex flex-col gap-5 pt-2">
                {/* Email body */}
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Corpo do email
                  </span>
                  <div className="mt-2 rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {selected.body_text}
                  </div>
                </div>

                {/* Suggestion or internal action */}
                {selected.suggestion && (() => {
                  const isSelectedNoReply = selected.suggestion.startsWith("Ação interna:")
                  return (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {isSelectedNoReply ? "Ação interna sugerida" : "Sugestão de resposta"}
                      </span>
                      {isSelectedNoReply && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                          <Archive className="h-4 w-4 shrink-0 text-amber-500" />
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            Este email é automático e não aceita respostas diretas
                          </span>
                        </div>
                      )}
                      <div className="mt-2 rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                        {selected.suggestion}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

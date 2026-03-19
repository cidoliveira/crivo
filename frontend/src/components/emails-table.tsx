import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { type EmailsData } from "@/hooks/use-emails"
import { EmptyState } from "./empty-state"

interface EmailsTableProps {
  data: EmailsData
  page: number
  onPageChange: (page: number) => void
  onClassifyClick?: () => void
}

function truncate(text: string, max = 60): string {
  return text.length <= max ? text : text.slice(0, max) + "..."
}

// Static lookup to avoid Tailwind v4 purging dynamic class strings
const labelStyles: Record<string, string> = {
  Produtivo: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  Improdutivo: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function EmailsTable({ data, page, onPageChange, onClassifyClick }: EmailsTableProps) {
  const totalPages = Math.ceil(data.total / data.page_size)

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Email</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Confianca</TableHead>
            <TableHead className="w-[25%]">Sugestao</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-0 border-0">
                <EmptyState
                  title="Nenhuma classificacao ainda"
                  description="Classifique emails para ver o historico aqui"
                  action={onClassifyClick ? {
                    label: "Classificar email",
                    onClick: onClassifyClick,
                  } : undefined}
                />
              </TableCell>
            </TableRow>
          ) : (
            data.items.map((row) => {
              const suggestionPreview = row.suggestion
                ? truncate(row.suggestion.split("\n")[0], 40)
                : "—"
              return (
                <TableRow key={row.id}>
                  <TableCell className="max-w-0">
                    <span className="block truncate text-sm">
                      {truncate(row.body_preview, 60)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                        labelStyles[row.label] ?? "border-border",
                      ].join(" ")}
                    >
                      {row.label}
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {Math.round(row.confidence * 100)}%
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-0">
                    <span className="block truncate">{suggestionPreview}</span>
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
          Pagina {page} de {totalPages || 1}
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
            Proxima
          </Button>
        </div>
      </div>
    </div>
  )
}

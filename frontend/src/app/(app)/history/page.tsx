"use client"

import { useState } from "react"
import { Topbar } from "@/components/topbar"
import { EmailsTable } from "@/components/emails-table"
import { useEmails } from "@/hooks/use-emails"
import { Skeleton } from "@/components/ui/skeleton"

export default function HistoryPage() {
  const [page, setPage] = useState(1)
  const emails = useEmails(page)

  return (
    <>
      <Topbar title="Histórico" />
      <div className="p-5 lg:p-6">
        {emails.isSuccess && emails.data ? (
          <div
            className="rounded-[10px] overflow-hidden"
            style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.022) 0%, rgba(255,255,255,0.004) 100%)',
              border: '1px solid var(--rule)',
            }}
          >
            <EmailsTable
              data={emails.data}
              page={page}
              onPageChange={setPage}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

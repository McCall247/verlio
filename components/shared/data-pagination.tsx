"use client"

import { useRouter } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function DataPagination({
  page,
  pageSize,
  total,
  basePath,
  searchParams,
}: {
  page: number
  pageSize: number
  total: number
  basePath: string
  searchParams: Record<string, string | undefined>
}) {
  const router = useRouter()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  if (totalPages <= 1) return null

  function hrefFor(p: number) {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    params.set("page", String(p))
    return `${basePath}?${params.toString()}`
  }

  function go(p: number, e: React.MouseEvent) {
    e.preventDefault()
    router.push(hrefFor(p))
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={page > 1 ? hrefFor(page - 1) : undefined}
            onClick={(e) => page > 1 && go(page - 1, e)}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        <PaginationItem>
          <span className="px-3 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href={page < totalPages ? hrefFor(page + 1) : undefined}
            onClick={(e) => page < totalPages && go(page + 1, e)}
            aria-disabled={page >= totalPages}
            className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

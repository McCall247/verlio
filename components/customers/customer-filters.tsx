"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LIFECYCLE_STATUS_LABELS, LIFECYCLE_STATUSES } from "@/lib/constants"

type Source = { id: string; name: string }

export function CustomerFilters({ sources }: { sources: Source[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") ?? "")

  useEffect(() => {
    const current = searchParams.get("search") ?? ""
    if (search === current) return
    const handle = setTimeout(() => {
      updateParam("search", search || null)
    }, 350)
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers…"
          className="pl-8"
        />
      </div>

      <Select
        value={searchParams.get("lifecycle") ?? "all"}
        onValueChange={(v) => updateParam("lifecycle", v === "all" ? null : v)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {LIFECYCLE_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {LIFECYCLE_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("sourceId") ?? "all"}
        onValueChange={(v) => updateParam("sourceId", v === "all" ? null : v)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="All sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          {sources.map((source) => (
            <SelectItem key={source.id} value={source.id}>
              {source.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("sort") ?? "newest"}
        onValueChange={(v) => updateParam("sort", v === "newest" ? null : v)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
          <SelectItem value="name_asc">Name A–Z</SelectItem>
          <SelectItem value="name_desc">Name Z–A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

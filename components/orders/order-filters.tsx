"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PRODUCTION_STATUSES, PRODUCTION_STATUS_LABELS, PAYMENT_STATUSES, PAYMENT_STATUS_LABELS } from "@/lib/constants"

export function OrderFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("search") ?? "")

  useEffect(() => {
    const current = searchParams.get("search") ?? ""
    if (search === current) return
    const handle = setTimeout(() => updateParam("search", search || null), 350)
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
          placeholder="Search orders…"
          className="pl-8"
        />
      </div>

      <Select
        value={searchParams.get("productionStatus") ?? "all"}
        onValueChange={(v) => updateParam("productionStatus", v === "all" ? null : v)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="All production" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All production</SelectItem>
          {PRODUCTION_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {PRODUCTION_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("paymentStatus") ?? "all"}
        onValueChange={(v) => updateParam("paymentStatus", v === "all" ? null : v)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="All payments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All payments</SelectItem>
          {PAYMENT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {PAYMENT_STATUS_LABELS[status]}
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
          <SelectItem value="due_soon">Due soon</SelectItem>
          <SelectItem value="price_desc">Highest price</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

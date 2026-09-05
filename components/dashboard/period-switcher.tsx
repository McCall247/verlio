"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
] as const

export function PeriodSwitcher({ current }: { current: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(period: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("period", period)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="inline-flex rounded-lg border bg-background p-1">
      {PERIODS.map((p) => (
        <Button
          key={p.value}
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => handleChange(p.value)}
          className={cn(
            "rounded-md",
            current === p.value && "bg-foreground text-background hover:bg-foreground hover:text-background"
          )}
        >
          {p.label}
        </Button>
      ))}
    </div>
  )
}

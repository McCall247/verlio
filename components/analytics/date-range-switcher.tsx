"use client"

import { useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const PRESETS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "year", label: "This year" },
  { value: "last_year", label: "Last year" },
  { value: "custom", label: "Custom" },
] as const

export function DateRangeSwitcher({ current }: { current: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [customStart, setCustomStart] = useState(searchParams.get("start") ?? "")
  const [customEnd, setCustomEnd] = useState(searchParams.get("end") ?? "")

  function selectPreset(preset: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("range", preset)
    if (preset !== "custom") {
      params.delete("start")
      params.delete("end")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  function applyCustom() {
    if (!customStart || !customEnd) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("range", "custom")
    params.set("start", customStart)
    params.set("end", customEnd)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1 rounded-lg border bg-background p-1">
        {PRESETS.map((p) => (
          <Button
            key={p.value}
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => selectPreset(p.value)}
            className={cn(
              "rounded-md",
              current === p.value && "bg-foreground text-background hover:bg-foreground hover:text-background"
            )}
          >
            {p.label}
          </Button>
        ))}
      </div>
      {current === "custom" && (
        <div className="flex flex-wrap items-center gap-2">
          <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-auto" />
          <span className="text-sm text-muted-foreground">to</span>
          <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-auto" />
          <Button type="button" size="sm" onClick={applyCustom}>
            Apply
          </Button>
        </div>
      )}
    </div>
  )
}

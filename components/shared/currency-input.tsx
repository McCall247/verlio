"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function formatWithCommas(digits: string) {
  if (!digits) return ""
  const [intPart, decPart] = digits.split(".")
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas
}

export function CurrencyInput({
  currencySymbol,
  value,
  onChange,
  id,
  className,
}: {
  currencySymbol: string
  value: number
  onChange: (value: number) => void
  id?: string
  className?: string
}) {
  // While actively typing, show exactly what was typed (draft). Once not
  // editing, derive the formatted display straight from `value` on render
  // — no effect needed to keep the two in sync.
  const [draft, setDraft] = useState<string | null>(null)
  const displayValue = draft ?? formatWithCommas(value ? String(value) : "")

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
        {currencySymbol}
      </span>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        className={cn("pl-7", className)}
        value={displayValue}
        onChange={(e) => {
          const raw = e.target.value.replace(/,/g, "")
          if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) return
          setDraft(e.target.value)
          onChange(raw === "" ? 0 : parseFloat(raw) || 0)
        }}
        onBlur={() => setDraft(null)}
      />
    </div>
  )
}

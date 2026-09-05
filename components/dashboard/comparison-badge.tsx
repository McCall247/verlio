import { ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ComparisonBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) {
    if (current === 0) return null
    return <span className="text-xs font-medium text-emerald-600">New</span>
  }

  const pct = ((current - previous) / previous) * 100
  const isUp = pct >= 0

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isUp ? "text-emerald-600" : "text-red-600"
      )}
    >
      {isUp ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  )
}

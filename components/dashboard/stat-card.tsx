import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ComparisonBadge } from "@/components/dashboard/comparison-badge"

export function StatCard({
  label,
  value,
  comparison,
  sublabel,
  icon: Icon,
}: {
  label: string
  value: string
  comparison?: { current: number; previous: number }
  sublabel?: string
  icon?: LucideIcon
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          {Icon && (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-accent-soft)]">
              <Icon className="size-4 text-[var(--brand-accent)]" />
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {comparison && <ComparisonBadge {...comparison} />}
        </div>
        {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
      </CardContent>
    </Card>
  )
}

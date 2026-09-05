import { Card, CardContent } from "@/components/ui/card"
import { ComparisonBadge } from "@/components/dashboard/comparison-badge"

export function StatCard({
  label,
  value,
  comparison,
  sublabel,
}: {
  label: string
  value: string
  comparison?: { current: number; previous: number }
  sublabel?: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {comparison && <ComparisonBadge {...comparison} />}
        </div>
        {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
      </CardContent>
    </Card>
  )
}

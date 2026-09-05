import { Card, CardContent } from "@/components/ui/card"
import { formatMoney, formatDate } from "@/lib/format"

export function CustomerStats({
  stats,
  currencySymbol,
}: {
  stats: {
    totalOrders: number
    totalSpent: number
    avgOrderValue: number
    outstandingBalance: number
    lastOrderDate: string | null
  }
  currencySymbol: string
}) {
  const items = [
    { label: "Total orders", value: String(stats.totalOrders) },
    { label: "Total spent", value: formatMoney(stats.totalSpent, currencySymbol) },
    { label: "Avg. order value", value: formatMoney(stats.avgOrderValue, currencySymbol) },
    { label: "Outstanding balance", value: formatMoney(stats.outstandingBalance, currencySymbol) },
    { label: "Last order", value: formatDate(stats.lastOrderDate) },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

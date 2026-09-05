import { Card, CardContent } from "@/components/ui/card"
import { formatMoney, formatPercent } from "@/lib/format"

export function OrderFinancialSummary({
  sellingPrice,
  totalCost,
  profit,
  grossMarginPct,
  totalPaid,
  outstandingBalance,
  currencySymbol,
}: {
  sellingPrice: number
  totalCost: number
  profit: number
  grossMarginPct: number
  totalPaid: number
  outstandingBalance: number
  currencySymbol: string
}) {
  const items = [
    { label: "Selling price", value: formatMoney(sellingPrice, currencySymbol) },
    { label: "Production cost", value: formatMoney(totalCost, currencySymbol) },
    { label: "Profit", value: formatMoney(profit, currencySymbol) },
    { label: "Margin", value: formatPercent(grossMarginPct) },
    { label: "Paid", value: formatMoney(totalPaid, currencySymbol) },
    { label: "Outstanding", value: formatMoney(outstandingBalance, currencySymbol) },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-base font-semibold tracking-tight">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

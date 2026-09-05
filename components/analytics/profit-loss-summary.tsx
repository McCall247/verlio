import { formatMoney } from "@/lib/format"

export function ProfitLossSummary({
  revenue,
  productionCost,
  expenses,
  netProfit,
  currencySymbol,
}: {
  revenue: number
  productionCost: number
  expenses: number
  netProfit: number
  currencySymbol: string
}) {
  return (
    <div className="rounded-lg border bg-background p-5">
      <dl className="flex flex-col divide-y">
        <Row label="Total revenue" value={revenue} symbol={currencySymbol} />
        <Row label="Production costs" value={-productionCost} symbol={currencySymbol} isDeduction />
        <Row label="Business expenses" value={-expenses} symbol={currencySymbol} isDeduction />
        <Row label="Net profit" value={netProfit} symbol={currencySymbol} bold />
      </dl>
    </div>
  )
}

function Row({
  label,
  value,
  symbol,
  bold,
  isDeduction,
}: {
  label: string
  value: number
  symbol: string
  bold?: boolean
  isDeduction?: boolean
}) {
  return (
    <div className={`flex items-center justify-between py-3 ${bold ? "pt-4" : ""}`}>
      <dt className={bold ? "font-semibold" : "text-muted-foreground"}>{label}</dt>
      <dd className={bold ? "text-lg font-semibold" : isDeduction ? "text-destructive" : "font-medium"}>
        {isDeduction ? "-" : ""}
        {formatMoney(Math.abs(value), symbol)}
      </dd>
    </div>
  )
}

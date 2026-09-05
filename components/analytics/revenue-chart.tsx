"use client"

import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer } from "@/components/analytics/chart-container"
import { formatDate, formatMoney } from "@/lib/format"
import type { RevenueAnalyticsRow } from "@/lib/queries/analytics"

export function RevenueChart({ data, currencySymbol }: { data: RevenueAnalyticsRow[]; currencySymbol: string }) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        No revenue data in this range yet.
      </div>
    )
  }

  return (
    <ChartContainer title="Revenue, production cost & profit">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="bucket"
          tickFormatter={(v) => formatDate(v, "MMM d")}
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(v) => `${currencySymbol}${Intl.NumberFormat("en-US", { notation: "compact" }).format(v)}`}
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <Tooltip
          formatter={(value, name) => [formatMoney(Number(value), currencySymbol), String(name)]}
          labelFormatter={(v) => formatDate(v as string)}
          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
        <Line
          type="monotone"
          dataKey="production_cost"
          name="Production cost"
          stroke="var(--color-chart-2)"
          strokeWidth={2}
          dot={false}
        />
        <Line type="monotone" dataKey="profit" name="Profit" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  )
}

"use client"

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer } from "@/components/analytics/chart-container"
import { formatMoney } from "@/lib/format"
import type { AcquisitionSourceStat } from "@/lib/queries/analytics"

export function AcquisitionRevenueChart({
  data,
  currencySymbol,
}: {
  data: AcquisitionSourceStat[]
  currencySymbol: string
}) {
  const hasData = data.some((d) => d.revenue > 0 || d.customer_count > 0)

  if (!hasData) {
    return (
      <div className="flex h-60 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        No customer data yet.
      </div>
    )
  }

  return (
    <ChartContainer title="Revenue by acquisition source" height={Math.max(240, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => `${currencySymbol}${Intl.NumberFormat("en-US", { notation: "compact" }).format(v)}`}
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={100}
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value) => formatMoney(Number(value), currencySymbol)}
          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
        />
        <Bar dataKey="revenue" name="Revenue" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

"use client"

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts"
import { ChartContainer } from "@/components/analytics/chart-container"
import { formatDate } from "@/lib/format"
import type { RevenueAnalyticsRow } from "@/lib/queries/analytics"

export function OrdersChart({ data }: { data: RevenueAnalyticsRow[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border text-sm text-muted-foreground">
        No orders in this range yet.
      </div>
    )
  }

  return (
    <ChartContainer title="Orders placed" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="bucket"
          tickFormatter={(v) => formatDate(v, "MMM d")}
          stroke="var(--muted-foreground)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={32} />
        <Tooltip
          labelFormatter={(v) => formatDate(v as string)}
          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 13 }}
        />
        <Bar dataKey="order_count" name="Orders" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}

"use client"

import { ResponsiveContainer } from "recharts"

export function ChartContainer({
  title,
  children,
  height = 300,
}: {
  title?: string
  children: React.ReactElement
  height?: number
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      {title && <h3 className="mb-4 text-sm font-medium text-muted-foreground">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  )
}

import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangeSwitcher } from "@/components/analytics/date-range-switcher"
import { RevenueChart } from "@/components/analytics/revenue-chart"
import { OrdersChart } from "@/components/analytics/orders-chart"
import { AcquisitionRevenueChart } from "@/components/analytics/acquisition-revenue-chart"
import { AcquisitionSourceTable } from "@/components/analytics/acquisition-source-table"
import { ProfitLossSummary } from "@/components/analytics/profit-loss-summary"
import { getRevenueAnalytics, getAcquisitionSourceStats, getProfitAndLoss } from "@/lib/queries/analytics"
import { getCurrentBusiness } from "@/lib/auth/dal"
import { resolveRangePreset, type RangePreset } from "@/lib/date-ranges"

export const metadata: Metadata = { title: "Analytics — Atelier" }

const VALID_PRESETS: RangePreset[] = ["today", "week", "month", "last_month", "year", "last_year", "custom"]

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; start?: string; end?: string; tab?: string }>
}) {
  const { range: rangeParam, start: startParam, end: endParam, tab } = await searchParams
  const preset: RangePreset = VALID_PRESETS.includes(rangeParam as RangePreset) ? (rangeParam as RangePreset) : "month"

  const { start, end, granularity } =
    preset === "custom" && startParam && endParam
      ? { start: startParam, end: endParam, granularity: "day" as const }
      : resolveRangePreset(preset === "custom" ? "month" : preset)

  const business = await getCurrentBusiness()

  const [revenueData, sourceStats, pnl] = await Promise.all([
    getRevenueAnalytics(start, end, granularity),
    getAcquisitionSourceStats(),
    getProfitAndLoss(start, end),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Real-time performance, computed from your orders and payments.</p>
      </div>

      <Tabs defaultValue={tab ?? "revenue"}>
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="acquisition">Acquisition Sources</TabsTrigger>
          <TabsTrigger value="pnl">Profit &amp; Loss</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-6 flex flex-col gap-6">
          <DateRangeSwitcher current={preset} />
          <RevenueChart data={revenueData} currencySymbol={business.currency_symbol} />
          <OrdersChart data={revenueData} />
        </TabsContent>

        <TabsContent value="acquisition" className="mt-6 flex flex-col gap-6">
          <AcquisitionRevenueChart data={sourceStats} currencySymbol={business.currency_symbol} />
          <AcquisitionSourceTable data={sourceStats} currencySymbol={business.currency_symbol} />
        </TabsContent>

        <TabsContent value="pnl" className="mt-6 flex flex-col gap-6">
          <DateRangeSwitcher current={preset} />
          <div className="max-w-md">
            <ProfitLossSummary
              revenue={pnl.revenue}
              productionCost={pnl.production_cost}
              expenses={pnl.expenses}
              netProfit={pnl.net_profit}
              currencySymbol={business.currency_symbol}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import type { Metadata } from "next"
import { PeriodSwitcher } from "@/components/dashboard/period-switcher"
import { StatCard } from "@/components/dashboard/stat-card"
import { getDashboardSummary, type DashboardPeriod } from "@/lib/queries/dashboard"
import { getAuthedProfile, getCurrentBusiness } from "@/lib/auth/dal"
import { formatMoney } from "@/lib/format"

export const metadata: Metadata = { title: "Dashboard — Atelier" }

const VALID_PERIODS: DashboardPeriod[] = ["today", "week", "month", "year"]

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period: periodParam } = await searchParams
  const period: DashboardPeriod = VALID_PERIODS.includes(periodParam as DashboardPeriod)
    ? (periodParam as DashboardPeriod)
    : "month"

  const [{ profile }, business, summary] = await Promise.all([
    getAuthedProfile(),
    getCurrentBusiness(),
    getDashboardSummary(period),
  ])

  const symbol = business.currency_symbol
  const periodLabel = { today: "today", week: "this week", month: "this month", year: "this year" }[period]

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">Here&apos;s how {business.name} is doing {periodLabel}.</p>
        </div>
        <PeriodSwitcher current={period} />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">Revenue</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Revenue"
            value={formatMoney(summary.revenue.current, symbol)}
            comparison={summary.revenue}
          />
          <StatCard
            label="Production costs"
            value={formatMoney(summary.production_cost.current, symbol)}
            comparison={summary.production_cost}
          />
          <StatCard
            label="Gross profit"
            value={formatMoney(summary.gross_profit.current, symbol)}
            comparison={summary.gross_profit}
          />
          <StatCard
            label="Outstanding"
            value={formatMoney(summary.outstanding_balance, symbol)}
            sublabel="Across all open orders"
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">Orders</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="New orders" value={String(summary.orders.new)} sublabel={periodLabel} />
          <StatCard label="Active orders" value={String(summary.orders.active)} sublabel="In production" />
          <StatCard label="Completed" value={String(summary.orders.completed)} sublabel={periodLabel} />
          <StatCard label="Cancelled" value={String(summary.orders.cancelled)} sublabel={periodLabel} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">Customers</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total customers" value={String(summary.customers.total)} />
          <StatCard label="New" value={String(summary.customers.new_this_period)} sublabel={periodLabel} />
          <StatCard label="Returning" value={String(summary.customers.returning)} />
          <StatCard label="Inactive" value={String(summary.customers.inactive)} />
        </div>
      </section>
    </div>
  )
}

import {
  WalletIcon,
  PackageIcon,
  TrendingUpIcon,
  ClockIcon,
  ShoppingBagIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  UserPlusIcon,
  UserCheckIcon,
  UserXIcon,
} from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { SectionLabel } from "@/components/shared/section-label"
import type { DashboardSummary } from "@/lib/queries/dashboard"
import { formatMoney } from "@/lib/format"

export function BusinessDashboard({
  summary,
  symbol,
  periodLabel,
}: {
  summary: DashboardSummary
  symbol: string
  periodLabel: string
}) {
  return (
    <>
      <section className="flex flex-col gap-3">
        <SectionLabel>Revenue</SectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Revenue"
            value={formatMoney(summary.revenue.current, symbol)}
            comparison={summary.revenue}
            icon={WalletIcon}
          />
          <StatCard
            label="Production costs"
            value={formatMoney(summary.production_cost.current, symbol)}
            comparison={summary.production_cost}
            icon={PackageIcon}
          />
          <StatCard
            label="Gross profit"
            value={formatMoney(summary.gross_profit.current, symbol)}
            comparison={summary.gross_profit}
            icon={TrendingUpIcon}
          />
          <StatCard
            label="Outstanding"
            value={formatMoney(summary.outstanding_balance, symbol)}
            sublabel="Across all open orders"
            icon={ClockIcon}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel>Orders</SectionLabel>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="New orders" value={String(summary.orders.new)} sublabel={periodLabel} icon={ShoppingBagIcon} />
          <StatCard label="Active orders" value={String(summary.orders.active)} sublabel="In production" icon={RefreshCwIcon} />
          <StatCard label="Completed" value={String(summary.orders.completed)} sublabel={periodLabel} icon={CheckCircleIcon} />
          <StatCard label="Cancelled" value={String(summary.orders.cancelled)} sublabel={periodLabel} icon={XCircleIcon} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel>Customers</SectionLabel>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total customers" value={String(summary.customers.total)} icon={UsersIcon} />
          <StatCard label="New" value={String(summary.customers.new_this_period)} sublabel={periodLabel} icon={UserPlusIcon} />
          <StatCard label="Returning" value={String(summary.customers.returning)} icon={UserCheckIcon} />
          <StatCard label="Inactive" value={String(summary.customers.inactive)} icon={UserXIcon} />
        </div>
      </section>
    </>
  )
}

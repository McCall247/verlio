import { BanknoteIcon, ReceiptIcon, TrendingUpIcon, WalletIcon } from "lucide-react"
import { StatCard } from "@/components/dashboard/stat-card"
import { SectionLabel } from "@/components/shared/section-label"
import type { PersonalSummary } from "@/lib/queries/dashboard"
import { formatMoney } from "@/lib/format"

export function PersonalDashboard({
  summary,
  symbol,
  periodLabel,
}: {
  summary: PersonalSummary
  symbol: string
  periodLabel: string
}) {
  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>Money</SectionLabel>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Income"
          value={formatMoney(summary.income.current, symbol)}
          comparison={summary.income}
          sublabel={periodLabel}
          icon={BanknoteIcon}
        />
        <StatCard
          label="Expenses"
          value={formatMoney(summary.expenses.current, symbol)}
          comparison={summary.expenses}
          sublabel={periodLabel}
          icon={ReceiptIcon}
        />
        <StatCard
          label="Net"
          value={formatMoney(summary.net.current, symbol)}
          comparison={summary.net}
          sublabel={periodLabel}
          icon={TrendingUpIcon}
        />
        <StatCard
          label="Balance"
          value={formatMoney(summary.all_time_balance, symbol)}
          sublabel="All time"
          icon={WalletIcon}
        />
      </div>
    </section>
  )
}

import type { Metadata } from "next"
import { PeriodSwitcher } from "@/components/dashboard/period-switcher"
import { BusinessDashboard } from "@/components/dashboard/business-dashboard"
import { PersonalDashboard } from "@/components/dashboard/personal-dashboard"
import { getDashboardSummary, getPersonalSummary, type DashboardPeriod } from "@/lib/queries/dashboard"
import { getAuthedProfile, getCurrentBusiness } from "@/lib/auth/dal"

export const metadata: Metadata = { title: "Dashboard — Verlio" }

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

  const [{ profile }, business] = await Promise.all([getAuthedProfile(), getCurrentBusiness()])

  const symbol = business.currency_symbol
  const periodLabel = { today: "today", week: "this week", month: "this month", year: "this year" }[period]
  const isPersonal = business.account_type === "personal"

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back{profile.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isPersonal
              ? `Here's how your money is moving ${periodLabel}.`
              : `Here's how ${business.name} is doing ${periodLabel}.`}
          </p>
        </div>
        <PeriodSwitcher current={period} />
      </div>

      {isPersonal ? (
        <PersonalDashboard summary={await getPersonalSummary(period)} symbol={symbol} periodLabel={periodLabel} />
      ) : (
        <BusinessDashboard summary={await getDashboardSummary(period)} symbol={symbol} periodLabel={periodLabel} />
      )}
    </div>
  )
}

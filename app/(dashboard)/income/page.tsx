import type { Metadata } from "next"
import { IncomeForm } from "@/components/income/income-form"
import { IncomeTable } from "@/components/income/income-table"
import { DataPagination } from "@/components/shared/data-pagination"
import { listIncome, getIncomeCategories, getIncomeTotal } from "@/lib/queries/income"
import { getCurrentBusiness } from "@/lib/auth/dal"
import { formatMoney } from "@/lib/format"

export const metadata: Metadata = { title: "Income — Verlio" }

const PAGE_SIZE = 30

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page, 10) || 1 : 1

  const [business, { income, total }, categories, allTimeTotal] = await Promise.all([
    getCurrentBusiness(),
    listIncome({ page, pageSize: PAGE_SIZE }),
    getIncomeCategories(),
    getIncomeTotal(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Income</h1>
        <p className="text-sm text-muted-foreground">
          {total} entr{total === 1 ? "y" : "ies"} · {formatMoney(allTimeTotal, business.currency_symbol)} all-time
        </p>
      </div>

      <IncomeForm categories={categories} />

      <IncomeTable income={income} currencySymbol={business.currency_symbol} />

      <DataPagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/income" searchParams={params} />
    </div>
  )
}

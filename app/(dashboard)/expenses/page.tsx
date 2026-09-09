import type { Metadata } from "next"
import { ExpenseForm } from "@/components/expenses/expense-form"
import { ExpenseTable } from "@/components/expenses/expense-table"
import { DataPagination } from "@/components/shared/data-pagination"
import { listExpenses, getExpenseCategories, getExpensesTotal } from "@/lib/queries/expenses"
import { getCurrentBusiness } from "@/lib/auth/dal"
import { formatMoney } from "@/lib/format"

export const metadata: Metadata = { title: "Expenses — Verlio" }

const PAGE_SIZE = 30

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page, 10) || 1 : 1

  const [business, { expenses, total }, categories, allTimeTotal] = await Promise.all([
    getCurrentBusiness(),
    listExpenses({ page, pageSize: PAGE_SIZE }),
    getExpenseCategories(),
    getExpensesTotal(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
        <p className="text-sm text-muted-foreground">
          {total} expense{total === 1 ? "" : "s"} · {formatMoney(allTimeTotal, business.currency_symbol)} all-time
        </p>
      </div>

      <ExpenseForm categories={categories} />

      <ExpenseTable expenses={expenses} currencySymbol={business.currency_symbol} />

      <DataPagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/expenses" searchParams={params} />
    </div>
  )
}

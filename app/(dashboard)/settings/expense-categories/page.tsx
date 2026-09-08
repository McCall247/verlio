import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfigListManager } from "@/components/settings/config-list-manager"
import { listConfigItems } from "@/lib/queries/settings-lists"

export const metadata: Metadata = { title: "Expense categories — Atelier" }

export default async function ExpenseCategoriesSettingsPage() {
  const items = await listConfigItems("expense_categories")

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Expense categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigListManager table="expense_categories" path="/settings/expense-categories" items={items} />
        </CardContent>
      </Card>
    </div>
  )
}

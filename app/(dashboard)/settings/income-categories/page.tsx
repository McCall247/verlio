import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfigListManager } from "@/components/settings/config-list-manager"
import { listConfigItems } from "@/lib/queries/settings-lists"

export const metadata: Metadata = { title: "Income categories — Verlio" }

export default async function IncomeCategoriesSettingsPage() {
  const items = await listConfigItems("income_categories")

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Income categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigListManager table="income_categories" path="/settings/income-categories" items={items} />
        </CardContent>
      </Card>
    </div>
  )
}

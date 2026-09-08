import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfigListManager } from "@/components/settings/config-list-manager"
import { listConfigItems } from "@/lib/queries/settings-lists"

export const metadata: Metadata = { title: "Production cost categories — Atelier" }

export default async function CostCategoriesSettingsPage() {
  const items = await listConfigItems("cost_categories")

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Production cost categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigListManager table="cost_categories" path="/settings/cost-categories" items={items} />
        </CardContent>
      </Card>
    </div>
  )
}

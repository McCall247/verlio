import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfigListManager } from "@/components/settings/config-list-manager"
import { listConfigItems } from "@/lib/queries/settings-lists"

export const metadata: Metadata = { title: "Acquisition sources — Verlio" }

export default async function AcquisitionSourcesSettingsPage() {
  const items = await listConfigItems("acquisition_sources")

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Acquisition sources</CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigListManager table="acquisition_sources" path="/settings/acquisition-sources" items={items} />
        </CardContent>
      </Card>
    </div>
  )
}

import type { Metadata } from "next"
import { NotImplementedPlaceholder } from "@/components/shared/not-implemented-placeholder"

export const metadata: Metadata = { title: "Reports — Atelier" }

export default function ReportsPage() {
  return (
    <NotImplementedPlaceholder
      title="Reports"
      description="Exportable, scheduled, and custom business reports are planned for a future release. Check Analytics for real-time revenue, profit, and acquisition insights."
    />
  )
}

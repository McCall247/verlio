import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerForm } from "@/components/customers/customer-form"
import { getAcquisitionSources } from "@/lib/queries/customers"
import { getAuthedProfile } from "@/lib/auth/dal"

export const metadata: Metadata = { title: "Add customer — Atelier" }

export default async function NewCustomerPage() {
  const [{ profile }, sources] = await Promise.all([getAuthedProfile(), getAcquisitionSources()])

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Add a customer</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm businessId={profile.business_id} sources={sources} />
        </CardContent>
      </Card>
    </div>
  )
}

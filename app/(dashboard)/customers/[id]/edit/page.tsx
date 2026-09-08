import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerForm } from "@/components/customers/customer-form"
import { getCustomerDetail, getAcquisitionSources } from "@/lib/queries/customers"
import { getCurrentBusiness } from "@/lib/auth/dal"

export const metadata: Metadata = { title: "Edit customer — Atelier" }

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [business, detail, sources] = await Promise.all([
    getCurrentBusiness(),
    getCustomerDetail(id),
    getAcquisitionSources(),
  ])

  if (!detail) notFound()
  const { customer } = detail

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Edit {customer.full_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm
            businessId={business.id}
            sources={sources}
            customerId={customer.id}
            defaultValues={{
              fullName: customer.full_name,
              phone: customer.phone ?? "",
              email: customer.email ?? "",
              whatsapp: customer.whatsapp ?? "",
              address: customer.address ?? "",
              acquisitionSourceId: customer.acquisition_source_id ?? "",
              avatarUrl: customer.avatar_url ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderForm } from "@/components/orders/order-form"
import { listAllCustomersForPicker } from "@/lib/queries/customers"

export const metadata: Metadata = { title: "New order — Atelier CRM" }

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>
}) {
  const { customerId } = await searchParams
  const customers = await listAllCustomersForPicker()

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create an order</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderForm
            customers={customers}
            defaultValues={customerId ? { customerId } : undefined}
            lockCustomer={!!customerId}
          />
        </CardContent>
      </Card>
    </div>
  )
}

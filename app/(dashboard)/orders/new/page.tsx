import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderForm } from "@/components/orders/order-form"
import { listAllCustomersForPicker } from "@/lib/queries/customers"
import { getCurrentBusiness } from "@/lib/auth/dal"

export const metadata: Metadata = { title: "New order — Atelier" }

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>
}) {
  const { customerId } = await searchParams
  const [business, customers] = await Promise.all([getCurrentBusiness(), listAllCustomersForPicker()])

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
            currencySymbol={business.currency_symbol}
          />
        </CardContent>
      </Card>
    </div>
  )
}

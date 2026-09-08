import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderForm } from "@/components/orders/order-form"
import { getOrderDetail } from "@/lib/queries/orders"
import { listAllCustomersForPicker } from "@/lib/queries/customers"
import { getCurrentBusiness } from "@/lib/auth/dal"

export const metadata: Metadata = { title: "Edit order — Atelier" }

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [business, detail, customers] = await Promise.all([
    getCurrentBusiness(),
    getOrderDetail(id),
    listAllCustomersForPicker(),
  ])

  if (!detail) notFound()
  const { order } = detail

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Edit {order.outfit_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderForm
            customers={customers}
            orderId={order.id}
            currencySymbol={business.currency_symbol}
            defaultValues={{
              customerId: order.customer_id,
              outfitName: order.outfit_name,
              size: order.size ?? "",
              description: order.description ?? "",
              orderDate: order.order_date,
              dueDate: order.due_date ?? "",
              sellingPrice: order.selling_price,
              notes: order.notes ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

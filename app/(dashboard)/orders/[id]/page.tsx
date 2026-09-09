import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PencilIcon, UserRoundIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentStatusBadge } from "@/components/orders/status-badges"
import { ProductionStatusControl } from "@/components/orders/production-status-control"
import { OrderFinancialSummary } from "@/components/orders/order-financial-summary"
import { CostItemsEditor } from "@/components/orders/cost-items-editor"
import { PaymentsEditor } from "@/components/orders/payments-editor"
import { OrderImagesGallery } from "@/components/orders/order-images-gallery"
import { getOrderDetail, getCostCategories } from "@/lib/queries/orders"
import { getCurrentBusiness } from "@/lib/auth/dal"
import { PAYMENT_STATUS_LABELS, PRODUCTION_STATUS_LABELS } from "@/lib/constants"
import { formatDate, formatRelative } from "@/lib/format"

export const metadata: Metadata = { title: "Order — Verlio" }

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [business, detail, costCategories] = await Promise.all([
    getCurrentBusiness(),
    getOrderDetail(id),
    getCostCategories(),
  ])

  if (!detail) notFound()
  const { order, costItems, payments, images, history } = detail

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{order.order_number}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{order.outfit_name}</h1>
          <Link
            href={`/customers/${order.customers?.id}`}
            className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline"
          >
            <UserRoundIcon className="size-3.5" />
            {order.customers?.full_name}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <PaymentStatusBadge status={order.payment_status} />
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link href={`/orders/${order.id}/edit`}>
                <PencilIcon className="size-4" />
                Edit
              </Link>
            }
          />
        </div>
      </div>

      <OrderFinancialSummary
        sellingPrice={order.selling_price}
        totalCost={order.total_cost}
        profit={order.profit ?? 0}
        grossMarginPct={order.gross_margin_pct ?? 0}
        totalPaid={order.total_paid}
        outstandingBalance={order.outstanding_balance ?? 0}
        currencySymbol={business.currency_symbol}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Production status</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductionStatusControl orderId={order.id} status={order.production_status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Production costs</CardTitle>
            </CardHeader>
            <CardContent>
              <CostItemsEditor
                orderId={order.id}
                items={costItems}
                categories={costCategories}
                currencySymbol={business.currency_symbol}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentsEditor orderId={order.id} payments={payments} currencySymbol={business.currency_symbol} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reference photos</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderImagesGallery orderId={order.id} businessId={business.id} images={images} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <DetailRow label="Order date" value={formatDate(order.order_date)} />
              <DetailRow label="Due date" value={order.due_date ? formatDate(order.due_date) : "—"} />
              {order.size && <DetailRow label="Size" value={order.size} />}
              {order.description && <DetailRow label="Description" value={order.description} />}
              {order.notes && <DetailRow label="Notes" value={order.notes} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status history</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No status changes yet.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {history.map((entry) => {
                    const labels =
                      entry.status_type === "payment"
                        ? (PAYMENT_STATUS_LABELS as Record<string, string>)
                        : (PRODUCTION_STATUS_LABELS as Record<string, string>)
                    return (
                      <li key={entry.id} className="text-sm">
                        <p>
                          <span className="text-muted-foreground">
                            {entry.status_type === "payment" ? "Payment" : "Production"}:
                          </span>{" "}
                          {entry.from_status ? <>{labels[entry.from_status] ?? entry.from_status} → </> : null}
                          <span className="font-medium">{labels[entry.to_status] ?? entry.to_status}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{formatRelative(entry.changed_at)}</p>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap">{value}</p>
    </div>
  )
}

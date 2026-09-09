import type { Metadata } from "next"
import Link from "next/link"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { OrderFilters } from "@/components/orders/order-filters"
import { OrderTable } from "@/components/orders/order-table"
import { DataPagination } from "@/components/shared/data-pagination"
import { listOrders, type OrderListParams } from "@/lib/queries/orders"
import { getCurrentBusiness } from "@/lib/auth/dal"

export const metadata: Metadata = { title: "Orders — Verlio" }

const PAGE_SIZE = 20

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page, 10) || 1 : 1

  const [business, { orders, total }] = await Promise.all([
    getCurrentBusiness(),
    listOrders({
      search: params.search,
      productionStatus: params.productionStatus as OrderListParams["productionStatus"],
      paymentStatus: params.paymentStatus as OrderListParams["paymentStatus"],
      sort: params.sort as OrderListParams["sort"],
      page,
      pageSize: PAGE_SIZE,
    }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">{total} total order{total === 1 ? "" : "s"}</p>
        </div>
        <Button
          nativeButton={false}
          render={
            <Link href="/orders/new">
              <PlusIcon className="size-4" />
              New order
            </Link>
          }
        />
      </div>

      <OrderFilters />

      <OrderTable orders={orders} currencySymbol={business.currency_symbol} />

      <DataPagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/orders" searchParams={params} />
    </div>
  )
}

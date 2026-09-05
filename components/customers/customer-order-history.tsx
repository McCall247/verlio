import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductionStatusBadge } from "@/components/orders/status-badges"
import { formatDate, formatMoney } from "@/lib/format"
import type { CustomerOrderSummary } from "@/lib/queries/customers"

export function CustomerOrderHistory({
  orders,
  currencySymbol,
}: {
  orders: CustomerOrderSummary[]
  currencySymbol: string
}) {
  if (orders.length === 0) {
    return (
      <p className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground">
        No orders yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link href={`/orders/${order.id}`} className="font-medium hover:underline">
                  {order.outfit_name}
                </Link>
                <p className="text-xs text-muted-foreground">{order.order_number}</p>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(order.order_date)}</TableCell>
              <TableCell className="text-right">{formatMoney(order.selling_price, currencySymbol)}</TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatMoney(order.total_cost, currencySymbol)}
              </TableCell>
              <TableCell className="text-right font-medium">{formatMoney(order.profit, currencySymbol)}</TableCell>
              <TableCell>
                <ProductionStatusBadge status={order.production_status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

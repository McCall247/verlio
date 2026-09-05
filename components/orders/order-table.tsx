import Link from "next/link"
import { PackageIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductionStatusBadge, PaymentStatusBadge } from "@/components/orders/status-badges"
import { formatDate, formatMoney } from "@/lib/format"
import type { OrderListRow } from "@/lib/queries/orders"

export function OrderTable({ orders, currencySymbol }: { orders: OrderListRow[]; currencySymbol: string }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <PackageIcon className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No orders match your filters yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead>Production</TableHead>
            <TableHead>Payment</TableHead>
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
              <TableCell className="text-muted-foreground">{order.customers?.full_name ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {order.due_date ? formatDate(order.due_date) : "—"}
              </TableCell>
              <TableCell className="text-right">{formatMoney(order.selling_price, currencySymbol)}</TableCell>
              <TableCell className="text-right font-medium">{formatMoney(order.profit, currencySymbol)}</TableCell>
              <TableCell>
                <ProductionStatusBadge status={order.production_status} />
              </TableCell>
              <TableCell>
                <PaymentStatusBadge status={order.payment_status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

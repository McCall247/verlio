import type { Metadata } from "next"
import Link from "next/link"
import { WalletIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataPagination } from "@/components/shared/data-pagination"
import { listPayments } from "@/lib/queries/payments"
import { getCurrentBusiness } from "@/lib/auth/dal"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants"
import { formatDate, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Payments — Atelier" }

const PAGE_SIZE = 30

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page, 10) || 1 : 1

  const [business, { payments, total }] = await Promise.all([
    getCurrentBusiness(),
    listPayments({ page, pageSize: PAGE_SIZE }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">{total} payment{total === 1 ? "" : "s"} recorded</p>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <WalletIcon className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-muted-foreground">{formatDate(payment.payment_date)}</TableCell>
                  <TableCell>
                    {payment.orders ? (
                      <Link href={`/orders/${payment.orders.id}`} className="font-medium hover:underline">
                        {payment.orders.outfit_name}
                      </Link>
                    ) : (
                      "—"
                    )}
                    {payment.orders && <p className="text-xs text-muted-foreground">{payment.orders.order_number}</p>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.orders?.customers ? (
                      <Link href={`/customers/${payment.orders.customers.id}`} className="hover:underline">
                        {payment.orders.customers.full_name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {payment.method
                      ? PAYMENT_METHOD_LABELS[payment.method as keyof typeof PAYMENT_METHOD_LABELS]
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground capitalize">{payment.payment_type}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      payment.payment_type === "refund" && "text-destructive"
                    )}
                  >
                    {payment.payment_type === "refund" ? "-" : ""}
                    {formatMoney(payment.amount, business.currency_symbol)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <DataPagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/payments" searchParams={params} />
    </div>
  )
}

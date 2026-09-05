import Link from "next/link"
import Image from "next/image"
import { UserRoundIcon } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LIFECYCLE_STATUS_LABELS, type LifecycleStatus } from "@/lib/constants"
import { formatDate } from "@/lib/format"
import type { CustomerWithLifecycle } from "@/lib/queries/customers"

const LIFECYCLE_BADGE_CLASS: Record<LifecycleStatus, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  returning: "bg-violet-50 text-violet-700 border-violet-200",
  inactive: "bg-zinc-100 text-zinc-600 border-zinc-200",
}

export function CustomerTable({ customers }: { customers: CustomerWithLifecycle[] }) {
  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <UserRoundIcon className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No customers match your filters yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Added</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <Link href={`/customers/${customer.id}`} className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
                    {customer.avatar_url ? (
                      <Image src={customer.avatar_url} alt="" width={36} height={36} className="size-9 object-cover" />
                    ) : (
                      <UserRoundIcon className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className="font-medium">{customer.full_name}</span>
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{customer.phone || customer.email || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{customer.acquisition_source_name || "—"}</TableCell>
              <TableCell>
                <Badge variant="outline" className={LIFECYCLE_BADGE_CLASS[customer.lifecycle_status]}>
                  {LIFECYCLE_STATUS_LABELS[customer.lifecycle_status]}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">{formatDate(customer.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

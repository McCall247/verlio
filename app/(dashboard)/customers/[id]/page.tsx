import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { UserRoundIcon, PencilIcon, PhoneIcon, MailIcon, MessageCircleIcon, MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerStats } from "@/components/customers/customer-stats"
import { CustomerOrderHistory } from "@/components/customers/customer-order-history"
import { CustomerNotes } from "@/components/customers/customer-notes"
import { getCustomerDetail } from "@/lib/queries/customers"
import { getCurrentBusiness } from "@/lib/auth/dal"
import { LIFECYCLE_STATUS_LABELS } from "@/lib/constants"
import { formatDate } from "@/lib/format"

export const metadata: Metadata = { title: "Customer — Atelier" }

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [business, detail] = await Promise.all([getCurrentBusiness(), getCustomerDetail(id)])

  if (!detail) notFound()

  const { customer, orders, notes, stats } = detail
  const lifecycle = customer.lifecycle_status

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
            {customer.avatar_url ? (
              <Image src={customer.avatar_url} alt="" width={64} height={64} className="size-16 object-cover" />
            ) : (
              <UserRoundIcon className="size-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{customer.full_name}</h1>
            <p className="text-sm text-muted-foreground">
              {LIFECYCLE_STATUS_LABELS[lifecycle]} · Joined {formatDate(customer.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link href={`/customers/${customer.id}/edit`}>
                <PencilIcon className="size-4" />
                Edit
              </Link>
            }
          />
          <Button
            nativeButton={false}
            render={<Link href={`/orders/new?customerId=${customer.id}`}>New order</Link>}
          />
        </div>
      </div>

      <CustomerStats stats={stats} currencySymbol={business.currency_symbol} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Customer information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <InfoRow icon={PhoneIcon} label="Phone" value={customer.phone} />
            <InfoRow icon={MailIcon} label="Email" value={customer.email} />
            <InfoRow icon={MessageCircleIcon} label="WhatsApp" value={customer.whatsapp} />
            <InfoRow icon={MapPinIcon} label="Address" value={customer.address} />
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground">Acquisition source</p>
              <p className="mt-0.5 font-medium">{customer.acquisition_source_name || "Unknown"}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <div>
            <h2 className="mb-3 text-lg font-semibold tracking-tight">Order history</h2>
            <CustomerOrderHistory orders={orders} currencySymbol={business.currency_symbol} />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold tracking-tight">Notes</h2>
            <CustomerNotes customerId={customer.id} notes={notes} />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | null
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value || "—"}</p>
      </div>
    </div>
  )
}

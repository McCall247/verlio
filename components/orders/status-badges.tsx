import { Badge } from "@/components/ui/badge"
import {
  PAYMENT_STATUS_LABELS,
  PRODUCTION_STATUS_LABELS,
  type PaymentStatus,
  type ProductionStatus,
} from "@/lib/constants"
import { cn } from "@/lib/utils"

const PRODUCTION_BADGE_CLASS: Record<ProductionStatus, string> = {
  inquiry: "bg-zinc-100 text-zinc-600 border-zinc-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  measurements: "bg-blue-50 text-blue-700 border-blue-200",
  design: "bg-indigo-50 text-indigo-700 border-indigo-200",
  fabric: "bg-indigo-50 text-indigo-700 border-indigo-200",
  cutting: "bg-amber-50 text-amber-700 border-amber-200",
  sewing: "bg-amber-50 text-amber-700 border-amber-200",
  fitting: "bg-amber-50 text-amber-700 border-amber-200",
  alterations: "bg-amber-50 text-amber-700 border-amber-200",
  ready: "bg-violet-50 text-violet-700 border-violet-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
}

const PAYMENT_BADGE_CLASS: Record<PaymentStatus, string> = {
  unpaid: "bg-red-50 text-red-700 border-red-200",
  partially_paid: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  refunded: "bg-zinc-100 text-zinc-600 border-zinc-200",
}

export function ProductionStatusBadge({ status, className }: { status: ProductionStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn(PRODUCTION_BADGE_CLASS[status], className)}>
      {PRODUCTION_STATUS_LABELS[status]}
    </Badge>
  )
}

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn(PAYMENT_BADGE_CLASS[status], className)}>
      {PAYMENT_STATUS_LABELS[status]}
    </Badge>
  )
}

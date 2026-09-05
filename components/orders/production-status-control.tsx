"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { updateProductionStatus } from "@/actions/orders"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PRODUCTION_STATUSES, PRODUCTION_STATUS_LABELS, type ProductionStatus } from "@/lib/constants"

export function ProductionStatusControl({ orderId, status }: { orderId: string; status: ProductionStatus }) {
  const [isPending, startTransition] = useTransition()

  function handleChange(value: ProductionStatus | null) {
    if (!value) return
    startTransition(async () => {
      const result = await updateProductionStatus(orderId, value)
      if (result?.error) toast.error(result.error)
      else toast.success("Status updated")
    })
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-full sm:w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PRODUCTION_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {PRODUCTION_STATUS_LABELS[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

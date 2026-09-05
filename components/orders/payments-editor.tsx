"use client"

import { useState, useTransition } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { z } from "zod"
import { PlusIcon, TrashIcon } from "lucide-react"
import { addPayment, deletePayment } from "@/actions/orders"
import { paymentSchema, type PaymentInput } from "@/lib/validations/order"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS } from "@/lib/constants"
import { formatDate, formatMoney } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { OrderPayment } from "@/lib/queries/orders"

export function PaymentsEditor({
  orderId,
  payments,
  currencySymbol,
}: {
  orderId: string
  payments: OrderPayment[]
  currencySymbol: string
}) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof paymentSchema>, unknown, PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paymentType: "payment",
      paymentDate: new Date().toISOString().slice(0, 10),
      note: "",
    },
  })

  const paymentType = watch("paymentType")

  const onSubmit = (values: PaymentInput) => {
    startTransition(async () => {
      const result = await addPayment(orderId, values)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      reset({ amount: 0, paymentType: "payment", paymentDate: new Date().toISOString().slice(0, 10), note: "" })
    })
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deletePayment(orderId, id)
      if (result?.error) toast.error(result.error)
      setDeletingId(null)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {payments.length > 0 && (
        <ul className="flex flex-col divide-y rounded-lg border">
          {payments.map((payment) => (
            <li key={payment.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div>
                <p className="text-sm font-medium">
                  {payment.payment_type === "refund" ? "Refund" : "Payment"} · {formatDate(payment.payment_date)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {payment.method
                    ? PAYMENT_METHOD_LABELS[payment.method as keyof typeof PAYMENT_METHOD_LABELS]
                    : "—"}
                  {payment.note ? ` · ${payment.note}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-sm font-medium", payment.payment_type === "refund" && "text-destructive")}>
                  {payment.payment_type === "refund" ? "-" : ""}
                  {formatMoney(payment.amount, currencySymbol)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending && deletingId === payment.id}
                  onClick={() => handleDelete(payment.id)}
                >
                  <TrashIcon className="size-3.5 text-muted-foreground" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 rounded-lg border p-3">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={paymentType === "payment" ? "default" : "outline"}
            onClick={() => setValue("paymentType", "payment")}
          >
            Payment
          </Button>
          <Button
            type="button"
            size="sm"
            variant={paymentType === "refund" ? "default" : "outline"}
            onClick={() => setValue("paymentType", "refund")}
          >
            Refund
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <Input type="number" step="0.01" min="0" placeholder="Amount" {...register("amount")} />
          <Input type="date" {...register("paymentDate")} />
          <Controller
            control={control}
            name="method"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Method (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {PAYMENT_METHOD_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <Input placeholder="Note (optional)" {...register("note")} />

        {(errors.amount || errors.paymentDate) && (
          <p className="text-sm text-destructive">{errors.amount?.message || errors.paymentDate?.message}</p>
        )}

        <Button type="submit" size="sm" disabled={isPending} className="self-end">
          <PlusIcon className="size-3.5" />
          Add {paymentType === "refund" ? "refund" : "payment"}
        </Button>
      </form>
    </div>
  )
}

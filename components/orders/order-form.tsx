"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { z } from "zod"
import { createOrder, updateOrder } from "@/actions/orders"
import { orderSchema, type OrderInput } from "@/lib/validations/order"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { CustomerPicker } from "@/components/orders/customer-picker"

type CustomerOption = { id: string; full_name: string }

export function OrderForm({
  customers,
  orderId,
  defaultValues,
  lockCustomer,
}: {
  customers: CustomerOption[]
  orderId?: string
  defaultValues?: Partial<OrderInput>
  lockCustomer?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.input<typeof orderSchema>, unknown, OrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: "",
      outfitName: "",
      description: "",
      orderDate: new Date().toISOString().slice(0, 10),
      dueDate: "",
      sellingPrice: 0,
      notes: "",
      ...defaultValues,
    },
  })

  const onSubmit = (values: OrderInput) => {
    startTransition(async () => {
      const result = orderId ? await updateOrder(orderId, values) : await createOrder(values)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      if (orderId) {
        toast.success("Order updated")
        router.push(`/orders/${orderId}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel>Customer</FieldLabel>
          <Controller
            control={control}
            name="customerId"
            render={({ field }) => (
              <CustomerPicker
                customers={customers}
                value={field.value}
                onChange={field.onChange}
                disabled={lockCustomer}
              />
            )}
          />
          <FieldError errors={errors.customerId ? [errors.customerId] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="outfitName">Outfit / design name</FieldLabel>
          <Input id="outfitName" placeholder="Bridal Gown" {...register("outfitName")} />
          <FieldError errors={errors.outfitName ? [errors.outfitName] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea id="description" rows={2} placeholder="Style details, fabric preferences…" {...register("description")} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="orderDate">Order date</FieldLabel>
            <Input id="orderDate" type="date" {...register("orderDate")} />
            <FieldError errors={errors.orderDate ? [errors.orderDate] : undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="dueDate">Due date</FieldLabel>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="sellingPrice">Selling price</FieldLabel>
          <Input id="sellingPrice" type="number" step="0.01" min="0" {...register("sellingPrice")} />
          <FieldError errors={errors.sellingPrice ? [errors.sellingPrice] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={2} {...register("notes")} />
        </Field>

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Saving…" : orderId ? "Save changes" : "Create order"}
        </Button>
      </FieldGroup>
    </form>
  )
}

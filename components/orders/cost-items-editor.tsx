"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { z } from "zod"
import { PlusIcon, TrashIcon } from "lucide-react"
import { addCostItem, deleteCostItem } from "@/actions/orders"
import { costItemSchema, type CostItemInput } from "@/lib/validations/order"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CategoryCombobox } from "@/components/shared/category-combobox"
import { formatMoney } from "@/lib/format"

type CostCategory = { id: string; name: string }
type CostItem = { id: string; category_name: string; amount: number; note: string | null }

export function CostItemsEditor({
  orderId,
  items,
  categories,
  currencySymbol,
}: {
  orderId: string
  items: CostItem[]
  categories: CostCategory[]
  currencySymbol: string
}) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    register,
    formState: { errors },
  } = useForm<z.input<typeof costItemSchema>, unknown, CostItemInput>({
    resolver: zodResolver(costItemSchema),
    defaultValues: { categoryId: "", categoryName: "", amount: 0, note: "" },
  })

  const total = items.reduce((sum, i) => sum + Number(i.amount), 0)

  const onSubmit = (values: CostItemInput) => {
    startTransition(async () => {
      const result = await addCostItem(orderId, values)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      reset({ categoryId: "", categoryName: "", amount: 0, note: "" })
    })
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteCostItem(orderId, id)
      if (result?.error) toast.error(result.error)
      setDeletingId(null)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {items.length > 0 && (
        <ul className="flex flex-col divide-y rounded-lg border">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div>
                <p className="text-sm font-medium">{item.category_name}</p>
                {item.note && <p className="text-xs text-muted-foreground">{item.note}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{formatMoney(item.amount, currencySymbol)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending && deletingId === item.id}
                  onClick={() => handleDelete(item.id)}
                >
                  <TrashIcon className="size-3.5 text-muted-foreground" />
                </Button>
              </div>
            </li>
          ))}
          <li className="flex items-center justify-between px-4 py-2.5 font-medium">
            <span>Total production cost</span>
            <span>{formatMoney(total, currencySymbol)}</span>
          </li>
        </ul>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-start"
      >
        <div className="flex-1">
          <CategoryCombobox
            categories={categories}
            categoryId={watch("categoryId") ?? ""}
            categoryName={watch("categoryName")}
            onSelect={(id, name) => {
              setValue("categoryId", id)
              setValue("categoryName", name)
            }}
            onTextChange={(name) => {
              setValue("categoryId", "")
              setValue("categoryName", name)
            }}
          />
        </div>
        <Input type="number" step="0.01" min="0" placeholder="Amount" className="sm:w-32" {...register("amount")} />
        <Button type="submit" size="sm" disabled={isPending}>
          <PlusIcon className="size-3.5" />
          Add
        </Button>
      </form>
      {(errors.categoryName || errors.amount) && (
        <p className="text-sm text-destructive">{errors.categoryName?.message || errors.amount?.message}</p>
      )}
    </div>
  )
}

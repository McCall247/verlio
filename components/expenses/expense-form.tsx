"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { z } from "zod"
import { PlusIcon } from "lucide-react"
import { createExpense } from "@/actions/expenses"
import { expenseSchema, type ExpenseInput } from "@/lib/validations/expense"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CategoryCombobox } from "@/components/shared/category-combobox"

type ExpenseCategory = { id: string; name: string }

export function ExpenseForm({ categories }: { categories: ExpenseCategory[] }) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof expenseSchema>, unknown, ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      categoryId: "",
      categoryName: "",
      amount: 0,
      expenseDate: new Date().toISOString().slice(0, 10),
      description: "",
    },
  })

  const onSubmit = (values: ExpenseInput) => {
    startTransition(async () => {
      const result = await createExpense(values)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Expense recorded")
      reset({
        categoryId: "",
        categoryName: "",
        amount: 0,
        expenseDate: new Date().toISOString().slice(0, 10),
        description: "",
      })
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 rounded-lg border p-4">
      <div className="grid gap-3 sm:grid-cols-4">
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
        <Input type="number" step="0.01" min="0" placeholder="Amount" {...register("amount")} />
        <Input type="date" {...register("expenseDate")} />
        <Input placeholder="Description (optional)" {...register("description")} />
      </div>

      {(errors.categoryName || errors.amount || errors.expenseDate) && (
        <p className="text-sm text-destructive">
          {errors.categoryName?.message || errors.amount?.message || errors.expenseDate?.message}
        </p>
      )}

      <Button type="submit" size="sm" disabled={isPending} className="self-end">
        <PlusIcon className="size-3.5" />
        Add expense
      </Button>
    </form>
  )
}

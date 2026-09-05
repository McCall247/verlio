"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { ReceiptIcon, TrashIcon } from "lucide-react"
import { deleteExpense } from "@/actions/expenses"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatDate, formatMoney } from "@/lib/format"

type Expense = {
  id: string
  category_name: string
  amount: number
  expense_date: string
  description: string | null
}

export function ExpenseTable({ expenses, currencySymbol }: { expenses: Expense[]; currencySymbol: string }) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteExpense(id)
      if (result?.error) toast.error(result.error)
      setDeletingId(null)
    })
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <ReceiptIcon className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No expenses recorded yet.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="text-muted-foreground">{formatDate(expense.expense_date)}</TableCell>
              <TableCell className="font-medium">{expense.category_name}</TableCell>
              <TableCell className="text-muted-foreground">{expense.description || "—"}</TableCell>
              <TableCell className="text-right font-medium">{formatMoney(expense.amount, currencySymbol)}</TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending && deletingId === expense.id}
                  onClick={() => handleDelete(expense.id)}
                >
                  <TrashIcon className="size-3.5 text-muted-foreground" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

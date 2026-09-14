"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { BanknoteIcon, TrashIcon } from "lucide-react"
import { deleteIncome } from "@/actions/income"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatDate, formatMoney } from "@/lib/format"

type IncomeEntry = {
  id: string
  category_name: string
  amount: number
  income_date: string
  description: string | null
}

export function IncomeTable({ income, currencySymbol }: { income: IncomeEntry[]; currencySymbol: string }) {
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deleteIncome(id)
      if (result?.error) toast.error(result.error)
      setDeletingId(null)
    })
  }

  if (income.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <BanknoteIcon className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No income recorded yet.</p>
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
          {income.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="text-muted-foreground">{formatDate(entry.income_date)}</TableCell>
              <TableCell className="font-medium">{entry.category_name}</TableCell>
              <TableCell className="text-muted-foreground">{entry.description || "—"}</TableCell>
              <TableCell className="text-right font-medium">{formatMoney(entry.amount, currencySymbol)}</TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={isPending && deletingId === entry.id}
                  onClick={() => handleDelete(entry.id)}
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

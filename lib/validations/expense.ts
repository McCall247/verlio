import { z } from "zod"

export const expenseSchema = z.object({
  categoryId: z.string().optional(),
  categoryName: z.string().trim().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  expenseDate: z.string().min(1, "Date is required"),
  description: z.string().trim().optional(),
})

export type ExpenseInput = z.infer<typeof expenseSchema>

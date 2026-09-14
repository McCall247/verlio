import { z } from "zod"

export const incomeSchema = z.object({
  categoryId: z.string().optional(),
  categoryName: z.string().trim().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  incomeDate: z.string().min(1, "Date is required"),
  description: z.string().trim().optional(),
})

export type IncomeInput = z.infer<typeof incomeSchema>

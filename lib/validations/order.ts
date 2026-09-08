import { z } from "zod"
import { PAYMENT_METHODS, PRODUCTION_STATUSES } from "@/lib/constants"

export const orderSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  outfitName: z.string().trim().min(2, "Outfit name is required"),
  size: z.string().trim().optional(),
  description: z.string().trim().optional(),
  orderDate: z.string().min(1, "Order date is required"),
  dueDate: z.string().optional(),
  sellingPrice: z.coerce.number().min(0, "Selling price must be 0 or more"),
  notes: z.string().trim().optional(),
})

export type OrderInput = z.infer<typeof orderSchema>

export const costItemSchema = z.object({
  categoryId: z.string().optional(),
  categoryName: z.string().trim().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  note: z.string().trim().optional(),
})

export type CostItemInput = z.infer<typeof costItemSchema>

export const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paymentType: z.enum(["payment", "refund"]),
  paymentDate: z.string().min(1, "Date is required"),
  method: z.enum(PAYMENT_METHODS).optional(),
  note: z.string().trim().optional(),
})

export type PaymentInput = z.infer<typeof paymentSchema>

export const productionStatusSchema = z.object({
  status: z.enum(PRODUCTION_STATUSES),
})

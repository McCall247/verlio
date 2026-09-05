import { z } from "zod"

export const businessSettingsSchema = z.object({
  name: z.string().trim().min(2, "Business name must be at least 2 characters"),
  currencyCode: z.string().trim().min(3, "Use a 3-letter currency code").max(3),
  currencySymbol: z.string().trim().min(1, "Currency symbol is required").max(5),
  timezone: z.string().trim().min(1, "Timezone is required"),
  inactiveCustomerDays: z.coerce.number().int().min(1, "Must be at least 1 day"),
})

export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>

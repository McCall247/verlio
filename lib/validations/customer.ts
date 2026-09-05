import { z } from "zod"

export const customerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z.string().trim().max(40).optional(),
  email: z
    .string()
    .trim()
    .max(255)
    .optional()
    .refine((v) => !v || z.email().safeParse(v).success, "Enter a valid email"),
  whatsapp: z.string().trim().max(40).optional(),
  address: z.string().trim().max(500).optional(),
  acquisitionSourceId: z.string().optional(),
  note: z.string().trim().max(2000).optional(),
  avatarUrl: z.string().optional(),
})

export type CustomerInput = z.infer<typeof customerSchema>

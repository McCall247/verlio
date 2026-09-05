import { z } from "zod"

export const signupSchema = z.object({
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters"),
  fullName: z.string().trim().min(2, "Your name must be at least 2 characters"),
  email: z.email("Enter a valid email address").trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type SignupInput = z.infer<typeof signupSchema>

export const loginSchema = z.object({
  email: z.email("Enter a valid email address").trim(),
  password: z.string().min(1, "Password is required"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address").trim(),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validations/auth"

function getSiteUrl(host: string | null) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  const h = host ?? "localhost:3000"
  const protocol = h.startsWith("localhost") ? "http" : "https"
  return `${protocol}://${h}`
}

export async function signup(values: unknown) {
  const parsed = signupSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  const { businessName, fullName, email, password } = parsed.data

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { business_name: businessName, full_name: fullName } },
  })

  if (error) {
    return { error: error.message }
  }

  // If email confirmation is required, Supabase returns no session yet.
  if (!data.session) {
    redirect("/signup/check-email")
  }

  redirect("/dashboard")
}

export async function login(values: unknown) {
  const parsed = loginSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  const { email, password } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: "Invalid email or password" }
  }

  redirect("/dashboard")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function requestPasswordReset(values: unknown) {
  const parsed = forgotPasswordSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const headersList = await headers()
  const siteUrl = getSiteUrl(headersList.get("host"))

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/reset-password`,
  })

  // Always report success, regardless of whether the email exists, to avoid
  // leaking which addresses have accounts.
  return { success: true }
}

export async function updatePassword(values: unknown) {
  const parsed = resetPasswordSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

  if (error) {
    return { error: error.message }
  }

  await supabase.auth.signOut()
  redirect("/login")
}

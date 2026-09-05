"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getAuthedProfile } from "@/lib/auth/dal"
import { businessSettingsSchema } from "@/lib/validations/business"

export async function updateBusinessSettings(values: unknown) {
  const parsed = businessSettingsSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase
    .from("businesses")
    .update({
      name: parsed.data.name,
      currency_code: parsed.data.currencyCode.toUpperCase(),
      currency_symbol: parsed.data.currencySymbol,
      timezone: parsed.data.timezone,
      inactive_customer_days: parsed.data.inactiveCustomerDays,
    })
    .eq("id", profile.business_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/settings")
  revalidatePath("/dashboard")
  return { success: true }
}

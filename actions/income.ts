"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getAuthedProfile } from "@/lib/auth/dal"
import { incomeSchema } from "@/lib/validations/income"

export async function createIncome(values: unknown) {
  const parsed = incomeSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase.from("income_entries").insert({
    business_id: profile.business_id,
    category_id: parsed.data.categoryId || null,
    category_name: parsed.data.categoryName,
    amount: parsed.data.amount,
    income_date: parsed.data.incomeDate,
    description: parsed.data.description || null,
    created_by: profile.id,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/income")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteIncome(incomeId: string) {
  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase
    .from("income_entries")
    .delete()
    .eq("id", incomeId)
    .eq("business_id", profile.business_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/income")
  revalidatePath("/dashboard")
  return { success: true }
}

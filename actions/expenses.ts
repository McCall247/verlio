"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getAuthedProfile } from "@/lib/auth/dal"
import { expenseSchema } from "@/lib/validations/expense"

export async function createExpense(values: unknown) {
  const parsed = expenseSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase.from("expenses").insert({
    business_id: profile.business_id,
    category_id: parsed.data.categoryId || null,
    category_name: parsed.data.categoryName,
    amount: parsed.data.amount,
    expense_date: parsed.data.expenseDate,
    description: parsed.data.description || null,
    created_by: profile.id,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/expenses")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteExpense(expenseId: string) {
  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId)
    .eq("business_id", profile.business_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/expenses")
  revalidatePath("/dashboard")
  return { success: true }
}

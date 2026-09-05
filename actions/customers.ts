"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getAuthedProfile } from "@/lib/auth/dal"
import { customerSchema } from "@/lib/validations/customer"

export async function createCustomer(values: unknown) {
  const parsed = customerSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("customers")
    .insert({
      business_id: profile.business_id,
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      whatsapp: parsed.data.whatsapp || null,
      address: parsed.data.address || null,
      acquisition_source_id: parsed.data.acquisitionSourceId || null,
      avatar_url: parsed.data.avatarUrl || null,
    })
    .select("id")
    .single()

  if (error || !data) {
    return { error: error?.message ?? "Could not create customer" }
  }

  if (parsed.data.note) {
    await supabase.from("customer_notes").insert({
      business_id: profile.business_id,
      customer_id: data.id,
      author_id: profile.id,
      note: parsed.data.note,
    })
  }

  revalidatePath("/customers")
  redirect(`/customers/${data.id}`)
}

export async function updateCustomer(customerId: string, values: unknown) {
  const parsed = customerSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase
    .from("customers")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      whatsapp: parsed.data.whatsapp || null,
      address: parsed.data.address || null,
      acquisition_source_id: parsed.data.acquisitionSourceId || null,
      avatar_url: parsed.data.avatarUrl || null,
    })
    .eq("id", customerId)
    .eq("business_id", profile.business_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/customers/${customerId}`)
  revalidatePath("/customers")
  return { success: true }
}

export async function updateCustomerAvatar(customerId: string, avatarUrl: string | null) {
  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase
    .from("customers")
    .update({ avatar_url: avatarUrl })
    .eq("id", customerId)
    .eq("business_id", profile.business_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/customers/${customerId}`)
  revalidatePath("/customers")
  return { success: true }
}

export async function addCustomerNote(customerId: string, note: string) {
  const trimmed = note.trim()
  if (!trimmed) return { error: "Note cannot be empty" }

  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase.from("customer_notes").insert({
    business_id: profile.business_id,
    customer_id: customerId,
    author_id: profile.id,
    note: trimmed,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/customers/${customerId}`)
  return { success: true }
}

"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getAuthedProfile } from "@/lib/auth/dal"
import type { ConfigListTable } from "@/lib/queries/settings-lists"

export async function addConfigItem(table: ConfigListTable, path: string, name: string) {
  const trimmed = name.trim()
  if (!trimmed) {
    return { error: "Name is required" }
  }

  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase.from(table).insert({ business_id: profile.business_id, name: trimmed })

  if (error) {
    return { error: error.message.includes("duplicate") ? "That name already exists" : error.message }
  }

  revalidatePath(path)
  return { success: true }
}

export async function toggleConfigItemActive(table: ConfigListTable, path: string, id: string, isActive: boolean) {
  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase
    .from(table)
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("business_id", profile.business_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(path)
  return { success: true }
}

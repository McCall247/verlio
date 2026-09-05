import "server-only"
import { createClient } from "@/lib/supabase/server"

export type ConfigListTable = "acquisition_sources" | "cost_categories" | "expense_categories"

export async function listConfigItems(table: ConfigListTable) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(table)
    .select("id, name, is_active, is_default")
    .order("sort_order", { ascending: true })
  if (error) throw error
  return data ?? []
}

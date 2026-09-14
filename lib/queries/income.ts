import "server-only"
import { createClient } from "@/lib/supabase/server"

export async function listIncome({ page = 1, pageSize = 30 }: { page?: number; pageSize?: number }) {
  const supabase = await createClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from("income_entries")
    .select("*", { count: "exact" })
    .order("income_date", { ascending: false })
    .range(from, to)

  if (error) throw error
  return { income: data ?? [], total: count ?? 0, page, pageSize }
}

export async function getIncomeCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("income_categories")
    .select("id, name, is_active")
    .order("sort_order", { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getIncomeTotal() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("income_entries").select("amount")
  if (error) throw error
  return (data ?? []).reduce((sum, e) => sum + Number(e.amount), 0)
}

import "server-only"
import { createClient } from "@/lib/supabase/server"

export async function listPayments({ page = 1, pageSize = 30 }: { page?: number; pageSize?: number }) {
  const supabase = await createClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from("order_payments")
    .select(
      "id, amount, payment_type, payment_date, method, note, orders(id, order_number, outfit_name, customers(id, full_name))",
      { count: "exact" }
    )
    .order("payment_date", { ascending: false })
    .range(from, to)

  if (error) throw error
  return { payments: data ?? [], total: count ?? 0, page, pageSize }
}

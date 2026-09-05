import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/types/database.types"

type ProductionStatus = Database["public"]["Enums"]["production_status"]
type PaymentStatus = Database["public"]["Enums"]["payment_status"]

export type OrderListParams = {
  search?: string
  productionStatus?: ProductionStatus
  paymentStatus?: PaymentStatus
  sort?: "newest" | "oldest" | "due_soon" | "price_desc"
  page?: number
  pageSize?: number
}

export type OrderPayment = {
  id: string
  order_id: string
  amount: number
  payment_type: "payment" | "refund"
  payment_date: string
  method: Database["public"]["Enums"]["payment_method"] | null
  note: string | null
}

export type OrderListRow = {
  id: string
  order_number: string
  outfit_name: string
  due_date: string | null
  selling_price: number
  profit: number
  production_status: ProductionStatus
  payment_status: PaymentStatus
  customers: { id: string; full_name: string; avatar_url: string | null } | null
}

export async function listOrders(params: OrderListParams) {
  const supabase = await createClient()
  const page = Math.max(1, params.page ?? 1)
  const pageSize = params.pageSize ?? 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, outfit_name, order_date, due_date, selling_price, total_cost, profit, outstanding_balance, production_status, payment_status, customers(id, full_name, avatar_url)",
      { count: "exact" }
    )

  const safeSearch = params.search?.replace(/[(),]/g, " ").trim()
  if (safeSearch) {
    query = query.or(`outfit_name.ilike.%${safeSearch}%,order_number.ilike.%${safeSearch}%`)
  }
  if (params.productionStatus) {
    query = query.eq("production_status", params.productionStatus)
  }
  if (params.paymentStatus) {
    query = query.eq("payment_status", params.paymentStatus)
  }

  switch (params.sort) {
    case "oldest":
      query = query.order("order_date", { ascending: true })
      break
    case "due_soon":
      query = query.order("due_date", { ascending: true, nullsFirst: false })
      break
    case "price_desc":
      query = query.order("selling_price", { ascending: false })
      break
    default:
      query = query.order("order_date", { ascending: false })
  }

  const { data, error, count } = await query.range(from, to)
  if (error) throw error

  return { orders: (data ?? []) as OrderListRow[], total: count ?? 0, page, pageSize }
}

export async function getCostCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("cost_categories")
    .select("id, name, is_active")
    .order("sort_order", { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getOrderDetail(orderId: string) {
  const supabase = await createClient()

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, customers(id, full_name, avatar_url, phone)")
    .eq("id", orderId)
    .single()

  if (orderError || !order) return null

  const [{ data: costItems }, { data: payments }, { data: images }, { data: history }] = await Promise.all([
    supabase.from("order_cost_items").select("*").eq("order_id", orderId).order("created_at", { ascending: true }),
    supabase.from("order_payments").select("*").eq("order_id", orderId).order("payment_date", { ascending: false }),
    supabase.from("order_images").select("*").eq("order_id", orderId).order("sort_order", { ascending: true }),
    supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", orderId)
      .order("changed_at", { ascending: false }),
  ])

  const imagesWithUrls = await Promise.all(
    (images ?? []).map(async (img) => {
      const { data } = await supabase.storage.from("order-images").createSignedUrl(img.storage_path, 3600)
      return { ...img, url: data?.signedUrl ?? null }
    })
  )

  return {
    order,
    costItems: costItems ?? [],
    payments: (payments ?? []) as OrderPayment[],
    images: imagesWithUrls,
    history: history ?? [],
  }
}

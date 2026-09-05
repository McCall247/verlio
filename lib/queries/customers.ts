import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { LifecycleStatus } from "@/lib/constants"
import type { Database } from "@/lib/types/database.types"

// The customers_with_lifecycle view reports every column as nullable (a
// Postgres/PostgREST quirk for views), even though these are never actually
// null for a real row — narrow it once here rather than at every call site.
export type CustomerWithLifecycle = {
  id: string
  business_id: string
  full_name: string
  phone: string | null
  email: string | null
  whatsapp: string | null
  address: string | null
  avatar_url: string | null
  acquisition_source_id: string | null
  acquisition_source_name: string | null
  created_at: string
  updated_at: string
  lifecycle_status: LifecycleStatus
}

export type CustomerOrderSummary = {
  id: string
  order_number: string
  outfit_name: string
  order_date: string
  selling_price: number
  total_cost: number
  profit: number
  outstanding_balance: number
  production_status: Database["public"]["Enums"]["production_status"]
  payment_status: Database["public"]["Enums"]["payment_status"]
}

export type CustomerNoteWithAuthor = {
  id: string
  note: string
  created_at: string
  profiles: { full_name: string | null } | null
}

export type CustomerListParams = {
  search?: string
  lifecycle?: string
  sourceId?: string
  sort?: "name_asc" | "name_desc" | "newest" | "oldest"
  page?: number
  pageSize?: number
}

export async function listCustomers(params: CustomerListParams) {
  const supabase = await createClient()
  const page = Math.max(1, params.page ?? 1)
  const pageSize = params.pageSize ?? 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("customers_with_lifecycle")
    .select("*", { count: "exact" })

  const safeSearch = params.search?.replace(/[(),]/g, " ").trim()
  if (safeSearch) {
    query = query.or(
      `full_name.ilike.%${safeSearch}%,phone.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`
    )
  }
  if (params.lifecycle) {
    query = query.eq("lifecycle_status", params.lifecycle)
  }
  if (params.sourceId) {
    query = query.eq("acquisition_source_id", params.sourceId)
  }

  switch (params.sort) {
    case "name_asc":
      query = query.order("full_name", { ascending: true })
      break
    case "name_desc":
      query = query.order("full_name", { ascending: false })
      break
    case "oldest":
      query = query.order("created_at", { ascending: true })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data, error, count } = await query.range(from, to)
  if (error) throw error

  return { customers: (data ?? []) as CustomerWithLifecycle[], total: count ?? 0, page, pageSize }
}

export async function listAllCustomersForPicker() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("customers")
    .select("id, full_name")
    .order("full_name", { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getAcquisitionSources() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("acquisition_sources")
    .select("id, name, is_active")
    .order("sort_order", { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getCustomerDetail(customerId: string) {
  const supabase = await createClient()

  const { data: customer, error: customerError } = await supabase
    .from("customers_with_lifecycle")
    .select("*")
    .eq("id", customerId)
    .single()

  if (customerError || !customer) return null
  const customerRow = customer as CustomerWithLifecycle

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(
      "id, order_number, outfit_name, order_date, selling_price, total_cost, profit, outstanding_balance, production_status, payment_status"
    )
    .eq("customer_id", customerId)
    .order("order_date", { ascending: false })

  if (ordersError) throw ordersError

  const { data: notes, error: notesError } = await supabase
    .from("customer_notes")
    .select("id, note, created_at, author_id, profiles(full_name)")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })

  if (notesError) throw notesError

  const orderList = (orders ?? []) as CustomerOrderSummary[]
  const totalOrders = orderList.length
  // total_spent = amount actually paid (total_paid), not the invoiced price.
  const totalSpent = orderList.reduce((sum, o) => sum + (o.selling_price - o.outstanding_balance), 0)
  const totalSelling = orderList.reduce((sum, o) => sum + o.selling_price, 0)
  const outstandingBalance = orderList.reduce((sum, o) => sum + o.outstanding_balance, 0)
  const avgOrderValue = totalOrders > 0 ? totalSelling / totalOrders : 0
  const lastOrderDate = orderList[0]?.order_date ?? null

  return {
    customer: customerRow,
    orders: orderList,
    notes: (notes ?? []) as CustomerNoteWithAuthor[],
    stats: {
      totalOrders,
      totalSpent,
      avgOrderValue,
      outstandingBalance,
      lastOrderDate,
    },
  }
}

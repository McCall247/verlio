import "server-only"
import { createClient } from "@/lib/supabase/server"

export type RevenueAnalyticsRow = {
  bucket: string
  revenue: number
  production_cost: number
  profit: number
  order_count: number
}

export async function getRevenueAnalytics(start: string, end: string, granularity: "day" | "week" | "month" = "day") {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_revenue_analytics", {
    p_start: start,
    p_end: end,
    p_granularity: granularity,
  })
  if (error) throw error
  return (data ?? []) as RevenueAnalyticsRow[]
}

export type AcquisitionSourceStat = {
  source_id: string
  name: string
  customer_count: number
  revenue: number
}

export async function getAcquisitionSourceStats() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("acquisition_source_stats")
    .select("source_id, name, customer_count, revenue")
    .order("revenue", { ascending: false })
  if (error) throw error
  return (data ?? []) as AcquisitionSourceStat[]
}

export async function getProfitAndLoss(start: string, end: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_profit_and_loss", { p_start: start, p_end: end })
  if (error) throw error
  return data as unknown as {
    range: { start: string; end: string }
    revenue: number
    production_cost: number
    expenses: number
    net_profit: number
  }
}

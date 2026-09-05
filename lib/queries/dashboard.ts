import "server-only"
import { createClient } from "@/lib/supabase/server"

export type DashboardPeriod = "today" | "week" | "month" | "year"

export type DashboardSummary = {
  period: string
  range: { start: string; end: string }
  revenue: { current: number; previous: number }
  production_cost: { current: number; previous: number }
  gross_profit: { current: number; previous: number }
  orders: { new: number; active: number; completed: number; cancelled: number }
  customers: { total: number; new_this_period: number; returning: number; inactive: number }
  outstanding_balance: number
}

export async function getDashboardSummary(period: DashboardPeriod) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_dashboard_summary", { p_period: period })
  if (error) throw error
  return data as unknown as DashboardSummary
}

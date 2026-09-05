import { format, formatDistanceToNow } from "date-fns"

export function formatMoney(amount: number | string | null | undefined, symbol: string) {
  const value = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0)
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
  return `${symbol}${formatted}`
}

export function formatDate(date: string | Date | null | undefined, pattern = "MMM d, yyyy") {
  if (!date) return "—"
  return format(new Date(date), pattern)
}

export function formatRelative(date: string | Date | null | undefined) {
  if (!date) return "—"
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatPercent(value: number | string | null | undefined) {
  const num = typeof value === "string" ? parseFloat(value) : (value ?? 0)
  return `${Number.isFinite(num) ? num.toFixed(1) : "0.0"}%`
}

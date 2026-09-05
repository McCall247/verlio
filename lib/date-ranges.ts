import { startOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears, format } from "date-fns"

export type RangePreset = "today" | "week" | "month" | "last_month" | "year" | "last_year" | "custom"

export function resolveRangePreset(preset: RangePreset, now = new Date()) {
  const fmt = (d: Date) => format(d, "yyyy-MM-dd")

  switch (preset) {
    case "today":
      return { start: fmt(now), end: fmt(now), granularity: "day" as const }
    case "week":
      return { start: fmt(startOfWeek(now)), end: fmt(now), granularity: "day" as const }
    case "last_month": {
      const lastMonth = subMonths(now, 1)
      return { start: fmt(startOfMonth(lastMonth)), end: fmt(endOfMonth(lastMonth)), granularity: "day" as const }
    }
    case "year":
      return { start: fmt(startOfYear(now)), end: fmt(now), granularity: "month" as const }
    case "last_year": {
      const lastYear = subYears(now, 1)
      return { start: fmt(startOfYear(lastYear)), end: fmt(endOfYear(lastYear)), granularity: "month" as const }
    }
    case "month":
    default:
      return { start: fmt(startOfMonth(now)), end: fmt(now), granularity: "day" as const }
  }
}

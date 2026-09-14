import {
  LayoutDashboardIcon,
  UsersIcon,
  ShoppingBagIcon,
  WalletIcon,
  ReceiptIcon,
  BanknoteIcon,
  BarChart3Icon,
  FileTextIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react"
import type { AccountType } from "@/lib/queries/dashboard"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  comingSoon?: boolean
}

const BUSINESS_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { label: "Customers", href: "/customers", icon: UsersIcon },
  { label: "Orders", href: "/orders", icon: ShoppingBagIcon },
  { label: "Payments", href: "/payments", icon: WalletIcon },
  { label: "Expenses", href: "/expenses", icon: ReceiptIcon },
  { label: "Analytics", href: "/analytics", icon: BarChart3Icon },
  { label: "Reports", href: "/reports", icon: FileTextIcon, comingSoon: true },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
]

const PERSONAL_NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboardIcon },
  { label: "Income", href: "/income", icon: BanknoteIcon },
  { label: "Expenses", href: "/expenses", icon: ReceiptIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
]

export function getNavItems(accountType: AccountType): NavItem[] {
  return accountType === "personal" ? PERSONAL_NAV_ITEMS : BUSINESS_NAV_ITEMS
}

export const PRODUCTION_STATUSES = [
  "inquiry",
  "confirmed",
  "measurements",
  "design",
  "fabric",
  "cutting",
  "sewing",
  "fitting",
  "alterations",
  "ready",
  "delivered",
  "cancelled",
] as const

export type ProductionStatus = (typeof PRODUCTION_STATUSES)[number]

export const PRODUCTION_STATUS_LABELS: Record<ProductionStatus, string> = {
  inquiry: "Inquiry",
  confirmed: "Confirmed",
  measurements: "Measurements",
  design: "Design",
  fabric: "Fabric",
  cutting: "Cutting",
  sewing: "Sewing",
  fitting: "Fitting",
  alterations: "Alterations",
  ready: "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export const PAYMENT_STATUSES = ["unpaid", "partially_paid", "paid", "refunded"] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  partially_paid: "Partially Paid",
  paid: "Paid",
  refunded: "Refunded",
}

export const PAYMENT_METHODS = ["cash", "bank_transfer", "card", "pos", "other"] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  card: "Card",
  pos: "POS",
  other: "Other",
}

export const LIFECYCLE_STATUSES = ["new", "active", "returning", "inactive"] as const
export type LifecycleStatus = (typeof LIFECYCLE_STATUSES)[number]

export const LIFECYCLE_STATUS_LABELS: Record<LifecycleStatus, string> = {
  new: "New",
  active: "Active",
  returning: "Returning",
  inactive: "Inactive",
}

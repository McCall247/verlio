import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRightIcon, TagIcon, ReceiptIcon, MegaphoneIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BusinessSettingsForm } from "@/components/settings/business-settings-form"
import { getCurrentBusiness } from "@/lib/auth/dal"

export const metadata: Metadata = { title: "Settings — Atelier" }

const CONFIG_LINKS = [
  { href: "/settings/acquisition-sources", label: "Acquisition sources", icon: MegaphoneIcon },
  { href: "/settings/cost-categories", label: "Production cost categories", icon: TagIcon },
  { href: "/settings/expense-categories", label: "Expense categories", icon: ReceiptIcon },
]

export default async function SettingsPage() {
  const business = await getCurrentBusiness()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Business essentials</CardTitle>
        </CardHeader>
        <CardContent>
          <BusinessSettingsForm
            defaultValues={{
              name: business.name,
              currencyCode: business.currency_code,
              currencySymbol: business.currency_symbol,
              timezone: business.timezone,
              inactiveCustomerDays: business.inactive_customer_days,
            }}
          />
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Configurable lists</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y p-0">
          {CONFIG_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between px-6 py-3.5 text-sm hover:bg-muted/50"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="size-4 text-muted-foreground" />
                  {link.label}
                </span>
                <ChevronRightIcon className="size-4 text-muted-foreground" />
              </Link>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

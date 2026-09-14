import { BrandMark } from "@/components/layout/brand-mark"
import { NavLinks } from "@/components/layout/nav-links"
import type { AccountType } from "@/lib/queries/dashboard"

export function Sidebar({ businessName, accountType }: { businessName: string; accountType: AccountType }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <BrandMark name={businessName} />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks accountType={accountType} />
      </div>
    </aside>
  )
}

import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { getAuthedProfile, getCurrentBusiness } from "@/lib/auth/dal"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getAuthedProfile()
  const business = await getCurrentBusiness()

  return (
    <div className="flex min-h-screen">
      <Sidebar businessName={business.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar businessName={business.name} userLabel={profile.full_name ?? "Account"} />
        <main className="flex-1 bg-background p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { MenuIcon, LogOutIcon } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { NavLinks } from "@/components/layout/nav-links"
import { BrandMark } from "@/components/layout/brand-mark"
import { logout } from "@/actions/auth"

export function Topbar({
  businessName,
  userLabel,
}: {
  businessName: string
  userLabel: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <MenuIcon className="size-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex h-16 items-center border-b px-6">
              <BrandMark name={businessName} />
            </div>
            <div className="px-3 py-4">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <BrandMark name={businessName} />
      </div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-accent-soft)] text-sm font-semibold text-[var(--brand-accent)]">
            {userLabel.trim().charAt(0).toUpperCase() || "?"}
          </span>
          <span className="hidden text-sm font-medium sm:inline">{userLabel}</span>
        </div>
        <form action={logout}>
          <Button variant="ghost" size="icon" type="submit" title="Log out" aria-label="Log out">
            <LogOutIcon className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  )
}

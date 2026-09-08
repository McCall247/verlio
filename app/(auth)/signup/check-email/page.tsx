import type { Metadata } from "next"
import { MailCheckIcon } from "lucide-react"

export const metadata: Metadata = { title: "Check your email — Atelier" }

export default function CheckEmailPage() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-auth-accent/10">
        <MailCheckIcon className="size-6 text-auth-accent" />
      </div>
      <h1 className="text-2xl font-semibold text-foreground">Check your inbox</h1>
      <p className="text-sm text-muted-foreground">
        We sent you a confirmation link. Click it to activate your account, then log in.
      </p>
    </div>
  )
}

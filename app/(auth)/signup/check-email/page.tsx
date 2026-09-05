import type { Metadata } from "next"
import { MailCheckIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = { title: "Check your email — Atelier CRM" }

export default function CheckEmailPage() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
          <MailCheckIcon className="size-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">Check your inbox</CardTitle>
        <CardDescription>
          We sent you a confirmation link. Click it to activate your account, then log in.
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  )
}

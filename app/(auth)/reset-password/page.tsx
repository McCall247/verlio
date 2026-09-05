import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = { title: "Set a new password — Atelier CRM" }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  const supabase = await createClient()

  let linkValid = false

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    linkValid = !error
  } else {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    linkValid = !!user
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Set a new password</CardTitle>
        <CardDescription>Choose a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {linkValid ? (
          <ResetPasswordForm />
        ) : (
          <p className="text-sm text-muted-foreground">
            This reset link is invalid or has expired. Request a new one from the login page.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = { title: "Create your studio — Atelier CRM" }

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Set up your studio</CardTitle>
        <CardDescription>Start managing customers, orders, and revenue in one place.</CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  )
}

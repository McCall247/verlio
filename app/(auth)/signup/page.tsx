import type { Metadata } from "next"
import { AuthHeader } from "@/components/auth/auth-header"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = { title: "Create your account — Verlio" }

export default function SignupPage() {
  return (
    <>
      <AuthHeader
        eyebrow="Get started"
        title="Create your account"
        description="Track a business or your own money — your call."
      />
      <SignupForm />
    </>
  )
}

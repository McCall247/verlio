import type { Metadata } from "next"
import { AuthHeader } from "@/components/auth/auth-header"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = { title: "Create your studio — Atelier" }

export default function SignupPage() {
  return (
    <>
      <AuthHeader
        eyebrow="Get started"
        title="Set up your studio"
        description="Start managing customers, orders, and revenue in one place."
      />
      <SignupForm />
    </>
  )
}

import type { Metadata } from "next"
import { AuthHeader } from "@/components/auth/auth-header"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = { title: "Reset password — Atelier" }

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader
        eyebrow="Reset password"
        title="Forgot your password?"
        description="We'll email you a link to set a new one."
      />
      <ForgotPasswordForm />
    </>
  )
}

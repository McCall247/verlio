import type { Metadata } from "next"
import { AuthHeader } from "@/components/auth/auth-header"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = { title: "Log in — Verlio" }

export default function LoginPage() {
  return (
    <>
      <AuthHeader eyebrow="Business sign in" title="Welcome back" description="Log in to your business dashboard." />
      <LoginForm />
    </>
  )
}

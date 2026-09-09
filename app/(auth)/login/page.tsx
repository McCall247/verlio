import type { Metadata } from "next"
import { AuthHeader } from "@/components/auth/auth-header"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = { title: "Log in — Verlio" }

export default function LoginPage() {
  return (
    <>
      <AuthHeader eyebrow="Sign in" title="Welcome back" description="Sign in to manage your business." />
      <LoginForm />
    </>
  )
}

"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRightIcon } from "lucide-react"
import { login } from "@/actions/auth"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { PasswordInput } from "@/components/auth/password-input"

const LABEL_CLASS = "text-xs font-medium tracking-[0.1em] text-muted-foreground uppercase"

export function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = (values: LoginInput) => {
    setFormError(null)
    startTransition(async () => {
      const result = await login(values)
      if (result?.error) {
        setFormError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email" className={LABEL_CLASS}>
            Email
          </FieldLabel>
          <Input id="email" type="email" placeholder="you@studio.com" {...register("email")} />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password" className={LABEL_CLASS}>
              Password
            </FieldLabel>
            <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground">
              Forgot password?
            </Link>
          </div>
          <PasswordInput id="password" {...register("password")} />
          <FieldError errors={errors.password ? [errors.password] : undefined} />
        </Field>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Logging in…" : "Log in"}
          {!isPending && <ArrowRightIcon data-icon="inline-end" className="size-4" />}
        </Button>
      </FieldGroup>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-auth-cream-border" />
        <span className="text-xs tracking-[0.1em] text-muted-foreground uppercase">Or</span>
        <div className="h-px flex-1 bg-auth-cream-border" />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        New to Atelier CRM?{" "}
        <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  )
}

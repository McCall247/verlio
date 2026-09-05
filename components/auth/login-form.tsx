"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { login } from "@/actions/auth"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"

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
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="you@studio.com" {...register("email")} />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link href="/forgot-password" className="text-sm text-muted-foreground underline underline-offset-4">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" {...register("password")} />
          <FieldError errors={errors.password ? [errors.password] : undefined} />
        </Field>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Logging in…" : "Log in"}
        </Button>
      </FieldGroup>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Atelier CRM?{" "}
        <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  )
}

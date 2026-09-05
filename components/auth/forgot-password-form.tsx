"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { MailCheckIcon } from "lucide-react"
import { requestPasswordReset } from "@/actions/auth"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = (values: ForgotPasswordInput) => {
    setFormError(null)
    startTransition(async () => {
      const result = await requestPasswordReset(values)
      if (result?.error) {
        setFormError(result.error)
        return
      }
      setSent(true)
    })
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <MailCheckIcon className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, we&apos;ve sent a link to reset your password.
        </p>
        <Link href="/login" className="text-sm font-medium underline underline-offset-4">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="you@studio.com" {...register("email")} />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Sending…" : "Send reset link"}
        </Button>
      </FieldGroup>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Back to login
        </Link>
      </p>
    </form>
  )
}

"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRightIcon } from "lucide-react"
import { updatePassword } from "@/actions/auth"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { PasswordInput } from "@/components/auth/password-input"

const LABEL_CLASS = "text-xs font-medium tracking-[0.1em] text-muted-foreground uppercase"

export function ResetPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  })

  const onSubmit = (values: ResetPasswordInput) => {
    setFormError(null)
    startTransition(async () => {
      const result = await updatePassword(values)
      if (result?.error) {
        setFormError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password" className={LABEL_CLASS}>
            New password
          </FieldLabel>
          <PasswordInput id="password" {...register("password")} />
          <FieldError errors={errors.password ? [errors.password] : undefined} />
        </Field>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Updating…" : "Update password"}
          {!isPending && <ArrowRightIcon data-icon="inline-end" className="size-4" />}
        </Button>
      </FieldGroup>
    </form>
  )
}

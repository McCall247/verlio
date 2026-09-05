"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updatePassword } from "@/actions/auth"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"

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
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <Input id="password" type="password" {...register("password")} />
          <FieldError errors={errors.password ? [errors.password] : undefined} />
        </Field>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Updating…" : "Update password"}
        </Button>
      </FieldGroup>
    </form>
  )
}

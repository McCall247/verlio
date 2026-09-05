"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signup } from "@/actions/auth"
import { signupSchema, type SignupInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"

export function SignupForm() {
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { businessName: "", fullName: "", email: "", password: "" },
  })

  const onSubmit = (values: SignupInput) => {
    setFormError(null)
    startTransition(async () => {
      const result = await signup(values)
      if (result?.error) {
        setFormError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="businessName">Business name</FieldLabel>
          <Input id="businessName" placeholder="Zaria Couture" {...register("businessName")} />
          <FieldError errors={errors.businessName ? [errors.businessName] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="fullName">Your name</FieldLabel>
          <Input id="fullName" placeholder="Amara Bello" {...register("fullName")} />
          <FieldError errors={errors.fullName ? [errors.fullName] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="you@studio.com" {...register("email")} />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" {...register("password")} />
          <FieldError errors={errors.password ? [errors.password] : undefined} />
        </Field>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating your studio…" : "Create account"}
        </Button>
      </FieldGroup>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </form>
  )
}

"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRightIcon, Building2Icon, UserIcon } from "lucide-react"
import { signup } from "@/actions/auth"
import { signupSchema, type SignupInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { PasswordInput } from "@/components/auth/password-input"
import { cn } from "@/lib/utils"

const LABEL_CLASS = "text-xs font-medium tracking-[0.1em] text-muted-foreground uppercase"

const ACCOUNT_TYPES = [
  {
    value: "business" as const,
    label: "Business",
    description: "Customers, orders, payments",
    icon: Building2Icon,
  },
  {
    value: "personal" as const,
    label: "Personal",
    description: "Income, spending, savings",
    icon: UserIcon,
  },
]

export function SignupForm() {
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { accountType: "business", businessName: "", fullName: "", email: "", password: "" },
  })

  const accountType = watch("accountType")
  const isPersonal = accountType === "personal"

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
          <FieldLabel className={LABEL_CLASS}>What are you tracking?</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            {ACCOUNT_TYPES.map((type) => {
              const Icon = type.icon
              const selected = accountType === type.value
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setValue("accountType", type.value)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
                    selected ? "border-[var(--brand-accent)] bg-[var(--brand-accent-soft)]" : "border-input hover:bg-muted"
                  )}
                >
                  <Icon className={cn("size-4", selected ? "text-[var(--brand-accent)]" : "text-muted-foreground")} />
                  <span className="text-sm font-medium">{type.label}</span>
                  <span className="text-xs text-muted-foreground">{type.description}</span>
                </button>
              )
            })}
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="businessName" className={LABEL_CLASS}>
            {isPersonal ? "Account name" : "Business name"}
          </FieldLabel>
          <Input
            id="businessName"
            placeholder="Type here"
            {...register("businessName")}
          />
          <FieldError errors={errors.businessName ? [errors.businessName] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="fullName" className={LABEL_CLASS}>
            Your name
          </FieldLabel>
          <Input id="fullName" placeholder="Type here" {...register("fullName")} />
          <FieldError errors={errors.fullName ? [errors.fullName] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="email" className={LABEL_CLASS}>
            Email
          </FieldLabel>
          <Input id="email" type="email" placeholder="you@business.com" {...register("email")} />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password" className={LABEL_CLASS}>
            Password
          </FieldLabel>
          <PasswordInput id="password" {...register("password")} />
          <FieldError errors={errors.password ? [errors.password] : undefined} />
        </Field>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating your account…" : "Create account"}
          {!isPending && <ArrowRightIcon data-icon="inline-end" className="size-4" />}
        </Button>
      </FieldGroup>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-auth-cream-border" />
        <span className="text-xs tracking-[0.1em] text-muted-foreground uppercase">Or</span>
        <div className="h-px flex-1 bg-auth-cream-border" />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </form>
  )
}

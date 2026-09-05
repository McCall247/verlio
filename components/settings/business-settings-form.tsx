"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { z } from "zod"
import { updateBusinessSettings } from "@/actions/business"
import { businessSettingsSchema, type BusinessSettingsInput } from "@/lib/validations/business"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"

export function BusinessSettingsForm({ defaultValues }: { defaultValues: BusinessSettingsInput }) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof businessSettingsSchema>, unknown, BusinessSettingsInput>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues,
  })

  const onSubmit = (values: BusinessSettingsInput) => {
    startTransition(async () => {
      const result = await updateBusinessSettings(values)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Settings saved")
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Business name</FieldLabel>
          <Input id="name" {...register("name")} />
          <FieldError errors={errors.name ? [errors.name] : undefined} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="currencyCode">Currency code</FieldLabel>
            <Input id="currencyCode" placeholder="NGN" maxLength={3} {...register("currencyCode")} />
            <FieldError errors={errors.currencyCode ? [errors.currencyCode] : undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="currencySymbol">Currency symbol</FieldLabel>
            <Input id="currencySymbol" placeholder="₦" {...register("currencySymbol")} />
            <FieldError errors={errors.currencySymbol ? [errors.currencySymbol] : undefined} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
          <Input id="timezone" placeholder="Africa/Lagos" {...register("timezone")} />
          <FieldDescription>An IANA timezone name — used to compute &quot;today&quot; and &quot;this week&quot; correctly.</FieldDescription>
          <FieldError errors={errors.timezone ? [errors.timezone] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="inactiveCustomerDays">Inactive after (days)</FieldLabel>
          <Input id="inactiveCustomerDays" type="number" min="1" {...register("inactiveCustomerDays")} />
          <FieldDescription>Customers with no order in this many days are marked inactive.</FieldDescription>
          <FieldError errors={errors.inactiveCustomerDays ? [errors.inactiveCustomerDays] : undefined} />
        </Field>

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </FieldGroup>
    </form>
  )
}

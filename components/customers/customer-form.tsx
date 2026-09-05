"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { createCustomer, updateCustomer } from "@/actions/customers"
import { customerSchema, type CustomerInput } from "@/lib/validations/customer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AvatarUpload } from "@/components/shared/avatar-upload"

type AcquisitionSource = { id: string; name: string; is_active: boolean }

export function CustomerForm({
  businessId,
  sources,
  customerId,
  defaultValues,
}: {
  businessId: string
  sources: AcquisitionSource[]
  customerId?: string
  defaultValues?: Partial<CustomerInput>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(defaultValues?.avatarUrl ?? null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      whatsapp: "",
      address: "",
      acquisitionSourceId: "",
      note: "",
      ...defaultValues,
    },
  })

  const onSubmit = (values: CustomerInput) => {
    const payload = { ...values, avatarUrl: avatarUrl ?? undefined }

    startTransition(async () => {
      const result = customerId
        ? await updateCustomer(customerId, payload)
        : await createCustomer(payload)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      if (customerId) {
        toast.success("Customer updated")
        router.push(`/customers/${customerId}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel>Photo</FieldLabel>
          <AvatarUpload businessId={businessId} value={avatarUrl} onChange={setAvatarUrl} />
        </Field>

        <Field>
          <FieldLabel htmlFor="fullName">Full name</FieldLabel>
          <Input id="fullName" placeholder="Amara Bello" {...register("fullName")} />
          <FieldError errors={errors.fullName ? [errors.fullName] : undefined} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" placeholder="080..." {...register("phone")} />
            <FieldError errors={errors.phone ? [errors.phone] : undefined} />
          </Field>
          <Field>
            <FieldLabel htmlFor="whatsapp">WhatsApp</FieldLabel>
            <Input id="whatsapp" placeholder="080..." {...register("whatsapp")} />
            <FieldError errors={errors.whatsapp ? [errors.whatsapp] : undefined} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="customer@email.com" {...register("email")} />
          <FieldError errors={errors.email ? [errors.email] : undefined} />
        </Field>

        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Textarea id="address" rows={2} {...register("address")} />
          <FieldError errors={errors.address ? [errors.address] : undefined} />
        </Field>

        <Field>
          <FieldLabel>How did they find you?</FieldLabel>
          <Controller
            control={control}
            name="acquisitionSourceId"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        {!customerId && (
          <Field>
            <FieldLabel htmlFor="note">Note (optional)</FieldLabel>
            <Textarea id="note" rows={3} placeholder="Anything worth remembering about this customer" {...register("note")} />
          </Field>
        )}

        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Saving…" : customerId ? "Save changes" : "Add customer"}
        </Button>
      </FieldGroup>
    </form>
  )
}

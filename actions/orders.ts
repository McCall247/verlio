"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getAuthedProfile } from "@/lib/auth/dal"
import { costItemSchema, orderSchema, paymentSchema, productionStatusSchema } from "@/lib/validations/order"

export async function createOrder(values: unknown) {
  const parsed = orderSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("orders")
    .insert({
      business_id: profile.business_id,
      customer_id: parsed.data.customerId,
      order_number: "", // assigned by the assign_order_number trigger
      outfit_name: parsed.data.outfitName,
      size: parsed.data.size || null,
      description: parsed.data.description || null,
      order_date: parsed.data.orderDate,
      due_date: parsed.data.dueDate || null,
      selling_price: parsed.data.sellingPrice,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single()

  if (error || !data) {
    return { error: error?.message ?? "Could not create order" }
  }

  revalidatePath("/orders")
  revalidatePath(`/customers/${parsed.data.customerId}`)
  redirect(`/orders/${data.id}`)
}

export async function updateOrder(orderId: string, values: unknown) {
  const parsed = orderSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase
    .from("orders")
    .update({
      customer_id: parsed.data.customerId,
      outfit_name: parsed.data.outfitName,
      size: parsed.data.size || null,
      description: parsed.data.description || null,
      order_date: parsed.data.orderDate,
      due_date: parsed.data.dueDate || null,
      selling_price: parsed.data.sellingPrice,
      notes: parsed.data.notes || null,
    })
    .eq("id", orderId)
    .eq("business_id", profile.business_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/orders/${orderId}`)
  revalidatePath("/orders")
  return { success: true }
}

export async function updateProductionStatus(orderId: string, status: unknown) {
  const parsed = productionStatusSchema.safeParse({ status })
  if (!parsed.success) {
    return { error: "Invalid status" }
  }

  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase
    .from("orders")
    .update({ production_status: parsed.data.status })
    .eq("id", orderId)
    .eq("business_id", profile.business_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/orders/${orderId}`)
  revalidatePath("/orders")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function addCostItem(orderId: string, values: unknown) {
  const parsed = costItemSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase.from("order_cost_items").insert({
    business_id: profile.business_id,
    order_id: orderId,
    category_id: parsed.data.categoryId || null,
    category_name: parsed.data.categoryName,
    amount: parsed.data.amount,
    note: parsed.data.note || null,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/orders/${orderId}`)
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteCostItem(orderId: string, costItemId: string) {
  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase
    .from("order_cost_items")
    .delete()
    .eq("id", costItemId)
    .eq("business_id", profile.business_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/orders/${orderId}`)
  revalidatePath("/dashboard")
  return { success: true }
}

export async function addPayment(orderId: string, values: unknown) {
  const parsed = paymentSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase.from("order_payments").insert({
    business_id: profile.business_id,
    order_id: orderId,
    amount: parsed.data.amount,
    payment_type: parsed.data.paymentType,
    payment_date: parsed.data.paymentDate,
    method: parsed.data.method || null,
    note: parsed.data.note || null,
    recorded_by: profile.id,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/orders/${orderId}`)
  revalidatePath("/payments")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deletePayment(orderId: string, paymentId: string) {
  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase
    .from("order_payments")
    .delete()
    .eq("id", paymentId)
    .eq("business_id", profile.business_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/orders/${orderId}`)
  revalidatePath("/payments")
  return { success: true }
}

export async function addOrderImage(orderId: string, storagePath: string, caption?: string) {
  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { error } = await supabase.from("order_images").insert({
    business_id: profile.business_id,
    order_id: orderId,
    storage_path: storagePath,
    caption: caption || null,
    uploaded_by: profile.id,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/orders/${orderId}`)
  return { success: true }
}

export async function deleteOrderImage(orderId: string, imageId: string, storagePath: string) {
  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  await supabase.storage.from("order-images").remove([storagePath])

  const { error } = await supabase
    .from("order_images")
    .delete()
    .eq("id", imageId)
    .eq("business_id", profile.business_id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/orders/${orderId}`)
  return { success: true }
}

import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const getAuthedProfile = cache(async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, business_id, full_name, role, avatar_url")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/login")
  }

  return { user, profile }
})

export const getCurrentBusiness = cache(async () => {
  const { profile } = await getAuthedProfile()
  const supabase = await createClient()

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", profile.business_id)
    .single()

  if (!business) {
    redirect("/login")
  }

  return business
})

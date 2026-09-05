import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database.types"

// Service-role client: bypasses RLS entirely. Never use this for normal
// user-triggered reads/writes — only for narrow, trusted server-side jobs.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client for trusted server contexts only (API routes, webhooks).
// Bypasses Row Level Security — never expose to the browser.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

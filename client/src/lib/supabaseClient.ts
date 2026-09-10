// Shared Supabase client — handles Auth (Google OAuth + email/password) and
// issues the session JWT the Express API verifies. The publishable key is
// public by design (safe to ship in the client bundle); it has no special
// privileges beyond what Supabase's Auth service allows.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY environment variables"
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

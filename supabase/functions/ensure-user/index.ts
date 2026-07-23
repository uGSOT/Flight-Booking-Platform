// ensure-user
// Phone-based sign-in helper (Architecture §4.1, option A). Creates (or repairs)
// a pre-confirmed Supabase user for a phone number using the service role, so
// NO confirmation email is ever sent. The client then signs in with the
// deterministic shim password. This sidesteps Supabase's email/rate-limit path.
//
// Auto-injected: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Deploy WITHOUT jwt verification (called before the user has a session):
//   supabase functions deploy ensure-user --no-verify-jwt
//
// Request body: { phone: string }   Response: { ok: true }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

// Must match src/lib/auth.js shimCredentials().
function shim(phone: string) {
  const digits = String(phone).replace(/\D/g, "");
  return { email: `u${digits}@airme.app`, password: `airme:${digits}:v1` };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { phone } = await req.json();
    if (!phone) return json({ error: "phone is required" }, 400);

    const { email, password } = shim(phone);
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Create pre-confirmed (email_confirm skips the confirmation email entirely).
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { phone },
    });

    if (error) {
      // Already registered → find the user and ensure it's confirmed with a known password.
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = list?.users?.find((u) => u.email === email);
      if (existing) {
        await admin.auth.admin.updateUserById(existing.id, {
          password,
          email_confirm: true,
          user_metadata: { phone },
        });
        return json({ ok: true, existed: true });
      }
      return json({ error: error.message }, 400);
    }

    return json({ ok: true, id: data.user?.id });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

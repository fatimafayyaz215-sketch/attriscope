import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles the OAuth and magic-link callback from Supabase.
 * Supabase redirects here after Google (or any provider) authentication.
 * The `code` query param is exchanged for a session via PKCE.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Explicit next override (e.g. ?next=/reset-password for password-reset flow)
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (next) {
        // Honour explicit override (password reset, magic link, etc.)
        return NextResponse.redirect(`${origin}${next}`);
      }
      // Determine redirect based on onboarding status stored in user metadata.
      const { data: { user } } = await supabase.auth.getUser();
      const onboarded = user?.user_metadata?.onboarding_completed === true;
      return NextResponse.redirect(`${origin}${onboarded ? "/dashboard" : "/onboarding"}`);
    }
  }

  // Something went wrong — send back to login with an error hint.
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

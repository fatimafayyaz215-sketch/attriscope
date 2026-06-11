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
  const next = searchParams.get("next");
  const authError = searchParams.get("error");
  const authErrorDescription = searchParams.get("error_description");

  const passwordResetNext = next === "/reset-password";

  if (authError) {
    const target = passwordResetNext
      ? `${origin}/reset-password?error=${encodeURIComponent(authErrorDescription ?? authError)}`
      : `${origin}/login?error=auth_callback_failed`;
    return NextResponse.redirect(target);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (passwordResetNext) {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      const { data: { user } } = await supabase.auth.getUser();
      const onboarded = user?.user_metadata?.onboarding_completed === true;
      return NextResponse.redirect(`${origin}${onboarded ? "/dashboard" : "/onboarding"}`);
    }

    if (passwordResetNext) {
      return NextResponse.redirect(`${origin}/reset-password?error=auth_callback_failed`);
    }
  }

  if (passwordResetNext) {
    return NextResponse.redirect(`${origin}/reset-password?error=auth_callback_failed`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

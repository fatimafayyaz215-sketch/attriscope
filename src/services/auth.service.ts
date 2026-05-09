/**
 * Auth Service — Supabase backend
 */

import { createClient } from "@/lib/supabase/client";
import type { LoginCredentials, RegisterData } from "@/types/auth";

export const authService = {
  login: async ({ email, password }: LoginCredentials) => {
    const supabase = createClient();
    return supabase.auth.signInWithPassword({ email, password: password! });
  },

  register: async ({ name, email, password }: RegisterData) => {
    const supabase = createClient();
    return supabase.auth.signUp({
      email,
      password: password!,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  loginWithGoogle: async () => {
    const supabase = createClient();
    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  forgotPassword: async (email: string) => {
    const supabase = createClient();
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
  },

  signOut: async () => {
    const supabase = createClient();
    return supabase.auth.signOut();
  },
};

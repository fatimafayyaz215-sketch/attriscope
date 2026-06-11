"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function prepareSession() {
      const supabase = createClient();
      const urlError = searchParams.get("error");

      const code = searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          await supabase.auth.signOut();
          if (!cancelled) {
            setError("This reset link is invalid or has expired. Request a new one.");
            setSessionReady(false);
            setCheckingSession(false);
          }
          return;
        }
        if (!cancelled) {
          router.replace("/reset-password");
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      const ready = !!session;

      if (urlError || !ready) {
        // Clear stale login sessions so /forgot-password is not bounced to /dashboard.
        await supabase.auth.signOut();
        if (cancelled) return;
        setSessionReady(false);
        setError(
          urlError
            ? "This reset link is invalid or has expired. Request a new one."
            : "This reset link is invalid or has expired. Request a new one.",
        );
        setCheckingSession(false);
        return;
      }

      setSessionReady(true);
      setCheckingSession(false);
    }

    void prepareSession();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  const handleRequestNewLink = async () => {
    await authService.signOut();
    router.push("/forgot-password");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await authService.updatePassword(password);
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await authService.signOut();
    setSuccess(true);
    setLoading(false);
  };

  if (checkingSession) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="mt-4 text-sm text-gray-500">Verifying reset link…</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Password updated</h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Your password has been changed. Sign in with your new password to continue.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 sm:py-3 rounded-lg text-sm transition-all"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="flex flex-col justify-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Link expired</h1>
        <p className="text-gray-500 text-xs sm:text-sm mb-6 leading-relaxed">
          {error ?? "This password reset link is no longer valid."}
        </p>
        <button
          type="button"
          onClick={() => void handleRequestNewLink()}
          className="inline-flex items-center justify-center gap-2 w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 sm:py-3 rounded-lg text-sm transition-all"
        >
          Request a new reset link
        </button>
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={async () => {
              await authService.signOut();
              router.push("/login");
            }}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Set a new password</h1>
      <p className="text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">
        Enter and confirm your new password below.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-password" className="text-[10px] sm:text-xs font-semibold tracking-wide sm:tracking-widest text-gray-500 uppercase">
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm-password" className="text-[10px] sm:text-xs font-semibold tracking-wide sm:tracking-widest text-gray-500 uppercase">
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            placeholder="Repeat new password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white font-semibold py-2.5 sm:py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Updating…" : "Update password"}
        </button>

        <div className="text-center mt-2">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}

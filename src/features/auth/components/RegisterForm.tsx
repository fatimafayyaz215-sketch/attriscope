"use client";

import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";

function friendlyError(msg: string): { text: string; showLogin: boolean } {
  const lower = msg.toLowerCase();
  if (
    lower.includes("user already registered") ||
    lower.includes("already been registered") ||
    lower.includes("email address is already") ||
    lower.includes("already exists")
  ) {
    return {
      text: "An account with this email already exists.",
      showLogin: true,
    };
  }
  if (lower.includes("rate limit")) {
    return { text: "Too many attempts. Please wait a moment and try again.", showLogin: false };
  }
  if (lower.includes("password") && lower.includes("weak")) {
    return { text: "Password is too weak. Use at least 8 characters with a special character.", showLogin: false };
  }
  return { text: msg, showLogin: false };
}

export default function RegisterForm() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowLogin(false);
    const { error } = await authService.register({ name: companyName, email, password });
    if (error) {
      const parsed = friendlyError(error.message);
      setError(parsed.text);
      setShowLogin(parsed.showLogin);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  // ── Check-inbox screen ──────────────────────────────────────────
  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-6">
        {/* Animated envelope */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          {/* Badge */}
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-1">
          We&apos;ve sent a confirmation link to
        </p>
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mb-5">
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-semibold text-gray-800">{email}</span>
        </div>

        <p className="text-gray-400 text-xs leading-relaxed max-w-65">
          Click the link in that email to verify your address and get started. The link expires in <strong className="text-gray-500">24 hours</strong>.
        </p>

        {/* Tip */}
        <div className="mt-6 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-left max-w-xs">
          <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-amber-700 leading-relaxed">
            Can&apos;t find it? Check your spam folder or{" "}
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="font-semibold underline hover:no-underline"
            >
              try a different email
            </button>
            .
          </p>
        </div>

        {/* Go back */}
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to sign up
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm mb-8">Start your 14-day free trial. No credit card required.</p>

        <form onSubmit={handleRegister} className="flex flex-col gap-5">

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {error}{" "}
                {showLogin && (
                  <Link href="/login" className="font-semibold underline hover:no-underline text-red-800">
                    Log in instead →
                  </Link>
                )}
              </span>
            </div>
          )}

          {/* Company Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-company" className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
              Company Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </span>
              <input
                id="register-company"
                type="text"
                placeholder="Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-email" className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                id="register-email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="register-password" className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="register-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Must be at least 8 characters long with 1 special character.
            </p>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              required
              className="mt-0.5 accent-blue-700 w-4 h-4 shrink-0"
            />
            <span className="text-xs text-gray-500 leading-relaxed">
              I agree to the{" "}
              Terms of Service
              {" "}and{" "}
              Privacy Policy.
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white font-semibold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creating workspace…
              </>
            ) : (
              <>
                Create Workspace
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Bottom section ─────────────────────────────────────────── */}
      <div className="mt-8 flex flex-col gap-8">
        <div className="flex items-center justify-between border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500">Already have an account?</p>
          <Link
            href="/login"
            className="border border-gray-300 hover:border-gray-400 text-blue-700 font-semibold hover:bg-gray-50 py-2.5 px-6 rounded-lg text-sm transition-all"
          >
            Log In
          </Link>
        </div>
      </div>
    </>
  );
}


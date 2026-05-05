"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up password reset
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Forgot your password?</h1>
      <p className="text-gray-500 text-sm mb-10 leading-relaxed">
        Enter the email address associated with your account, and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleReset} className="flex flex-col gap-6">
        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="reset-email" className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <input
              id="reset-email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white font-semibold py-3.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
        >
          Send Reset Link
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        {/* Back to Login */}
        <div className="text-center mt-2">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to login
          </Link>
        </div>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-10">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">or contact</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Support Link */}
      <div className="text-center">
        <Link href="/support" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 10v-4a6 6 0 10-12 0v4m0 4h2a2 2 0 002-2v-4a2 2 0 00-2-2H6m12 8h-2a2 2 0 01-2-2v-4a2 2 0 012-2h2m-6 4v6m0 0H8m4 0h4" />
          </svg>
          Request assistance from Support
        </Link>
      </div>

    </div>
  );
}

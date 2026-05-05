"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterForm() {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up registration
  };

  return (
    <>
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm mb-8">Start your 14-day free trial. No credit card required.</p>

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
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

          {/* Checkbox */}
          <div className="flex items-start gap-2 mt-2">
            <input
              id="register-agree"
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              required
              className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer shrink-0"
            />
            <label htmlFor="register-agree" className="text-sm text-gray-600">
              I agree to the <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white font-semibold py-3 rounded-lg text-sm transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
          >
            Create Workspace
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
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

        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Trusted by industry leaders</p>
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-5 bg-gray-200 rounded opacity-60" aria-hidden="true" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

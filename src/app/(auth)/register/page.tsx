import Link from "next/link";
import LoginLeftPanel from "@/features/auth/components/LoginLeftPanel";
import RegisterForm from "@/features/auth/components/RegisterForm";

export const metadata = {
  title: "Create an Account — ChurnIQ",
  description: "Start your 14-day free trial. No credit card required.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pt-[60px]">

      {/* ── Top nav ──────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 bg-blue-700 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-blue-900 font-bold text-base tracking-tight">ChurnGuard AI</span>
        </Link>
      </header>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div
          className="w-full bg-white rounded-2xl shadow-lg overflow-hidden flex"
          style={{ maxWidth: "900px", minHeight: "600px" }}
        >
          {/* Left panel – hidden on small screens */}
          <div className="hidden md:block">
            <LoginLeftPanel />
          </div>

          {/* Right panel */}
          <div
            className="flex-1 flex flex-col justify-between px-6 md:px-12 py-8 md:py-10"
            style={{ minWidth: 0 }}
          >
            <RegisterForm />
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="text-center text-xs text-gray-400 py-4">
        © 2026 ChurnIQ. All rights reserved. Built for high-stakes enterprise retention.
      </footer>

    </div>
  );
}

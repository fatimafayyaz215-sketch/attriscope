import Link from "next/link";
import LoginLeftPanel from "@/features/auth/components/LoginLeftPanel";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Sign In — ChurnIQ",
  description: "Sign in to your ChurnIQ account to monitor and prevent customer churn.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pt-[60px]">

      {/* ── Top nav ──────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="text-blue-700 font-bold text-lg tracking-tight">
            ChurnIQ
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <span className="cursor-pointer hover:text-gray-900 transition-colors">English (US)</span>
          <Link href="/support" className="hover:text-gray-900 transition-colors no-underline text-gray-600">
            Support
          </Link>
        </nav>
      </header>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div
          className="w-full bg-white rounded-2xl shadow-lg overflow-hidden flex"
          style={{ maxWidth: "900px", minHeight: "560px" }}
        >
          {/* Left panel */}
          <LoginLeftPanel />

          {/* Right panel */}
          <div
            className="flex-1 flex flex-col justify-between px-12 py-10"
            style={{ minWidth: 0 }}
          >
            <LoginForm />
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

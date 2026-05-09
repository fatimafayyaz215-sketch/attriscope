import Link from "next/link";

export default function OnboardingHeader({ step = 1, title = "Industry Context" }: { step?: number; title?: string }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 border-t-4 border-t-blue-600 px-4 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 min-h-14 sm:min-h-16">

      {/* Logo — matches sidebar exactly */}
      <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
        <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div className="hidden xs:block sm:block">
          <div className="text-blue-900 font-bold text-base leading-tight tracking-tight">ChurnGuard AI</div>
          <div className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">Vigilant Intelligence</div>
        </div>
      </Link>

      {/* Step indicator — centered on larger screens, compact on mobile */}
      <div className="flex-1 flex justify-center">
        <span className="text-xs sm:text-sm font-medium text-gray-500 text-center">
          <span className="hidden sm:inline">Step {step} of 3: {title}</span>
          <span className="sm:hidden">{step} / 3 · {title}</span>
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <button
          aria-label="Help"
          className="text-gray-400 hover:text-gray-600 transition-colors hidden sm:block"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <Link
          href="/dashboard"
          className="text-xs sm:text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors whitespace-nowrap"
        >
          <span className="hidden sm:inline">Save &amp; Exit</span>
          <span className="sm:hidden">Exit</span>
        </Link>
      </div>

    </header>
  );
}

import Link from "next/link";

export default function OnboardingHeader({ step = 1, title = "Industry Context" }: { step?: number; title?: string }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 border-t-4 border-t-blue-500 px-8 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 no-underline">
        <span className="text-blue-700 font-bold text-lg tracking-tight">
          ChurnIQ
        </span>
      </Link>
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <span className="font-medium text-gray-500">Step {step} of 3: {title}</span>
        <button aria-label="Help" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors font-medium">
          Save & Exit
        </Link>
      </div>
    </header>
  );
}

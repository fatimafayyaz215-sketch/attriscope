import Link from "next/link";
import AttriscopeLogo from "@/features/landing/components/AttriscopeLogo";
import { btnNavGhost, btnNavPrimary } from "@/features/landing/landing-ui";

/** Matches PublicHeader bar height (h-12 mobile, h-14 desktop). */
export const publicHeaderOffsetClass = "pt-12 sm:pt-14";

export default function PublicHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="h-12 sm:h-14 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-3">
        <AttriscopeLogo className="min-w-0" />

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Link href="/login" className={btnNavGhost}>
            Sign in
          </Link>
          <Link href="/register" className={btnNavPrimary}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}

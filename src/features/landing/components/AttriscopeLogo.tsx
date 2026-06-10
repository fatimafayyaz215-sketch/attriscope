import Link from "next/link";
import { APP_NAME } from "@/lib/brand";

type Props = {
  href?: string;
  className?: string;
};

export default function AttriscopeLogo({ href = "/", className = "" }: Props) {
  const content = (
    <>
      <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-700 rounded-md flex items-center justify-center shrink-0">
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </div>
      <span className="text-blue-900 font-bold text-sm sm:text-base tracking-tight leading-tight">
        {APP_NAME}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`flex items-center gap-1.5 sm:gap-2 no-underline hover:opacity-90 transition-opacity shrink-0 ${className}`}>
        {content}
      </Link>
    );
  }

  return <div className={`flex items-center gap-1.5 sm:gap-2 shrink-0 ${className}`}>{content}</div>;
}

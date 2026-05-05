import { ReactNode } from "react";

export default function OnboardingFooter({
  onBack,
  onContinue,
  canContinue = true,
  continueText = "Continue",
  continueIcon,
  middleContent,
}: {
  onBack?: () => void;
  onContinue?: () => void;
  canContinue?: boolean;
  continueText?: string;
  continueIcon?: ReactNode;
  middleContent?: ReactNode;
}) {
  return (
    <footer className="bg-white border-t border-gray-200 px-8 py-5 flex items-center justify-between">
      <div className="w-1/3 flex justify-start">
        <button
          onClick={onBack}
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold tracking-widest uppercase text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      <div className="w-1/3 flex justify-center">
        {middleContent}
      </div>

      <div className="w-1/3 flex justify-end">
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-[0.99] text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          {continueIcon ? continueIcon : null}
          {continueText}
          {!continueIcon && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>
      </div>
    </footer>
  );
}

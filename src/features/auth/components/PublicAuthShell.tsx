type Props = {
  children: React.ReactNode;
  leftPanel?: React.ReactNode;
  mdMinHeightClass?: string;
};

export default function PublicAuthShell({
  children,
  leftPanel,
  mdMinHeightClass = "md:min-h-[560px]",
}: Props) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div
          className={`w-full max-w-[900px] min-h-0 ${mdMinHeightClass} bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden flex`}
        >
          {leftPanel ? <div className="hidden md:flex self-stretch">{leftPanel}</div> : null}

          <div className="flex-1 flex flex-col justify-between px-4 sm:px-6 md:px-12 py-6 sm:py-8 md:py-10 min-w-0">
            {children}
          </div>
        </div>
      </main>

      <footer className="text-center text-[10px] sm:text-xs text-gray-400 py-3 sm:py-4 px-4 leading-relaxed">
        © 2026 Attriscope. All rights reserved.
      </footer>
    </div>
  );
}

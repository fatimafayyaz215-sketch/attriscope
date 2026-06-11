export default function ResetPasswordLeftPanel() {
  return (
    <div
      className="relative flex flex-col pt-10 px-10 pb-10 text-white overflow-hidden h-full"
      style={{
        width: "360px",
        minWidth: "360px",
        background: "linear-gradient(160deg, #2563eb 0%, #1d4ed8 50%, #1e3a8a 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-12 w-72 h-72 rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />

      <div className="relative">
        <h2 className="text-3xl font-bold leading-tight mb-4">
          Choose a new password.
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
          Pick a strong password you haven&apos;t used before. You&apos;ll sign in with it on your next visit.
        </p>
      </div>

      <div className="relative flex flex-col gap-5 mt-auto">
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm">At least 8 characters</p>
            <p className="text-xs leading-relaxed mt-0.5" style={{ color: "rgba(255,255,255,0.68)" }}>
              Use a mix of letters, numbers, and symbols for better security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

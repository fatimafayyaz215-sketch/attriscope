const features = [
  {
    icon: (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Advanced Analytics",
    description: "Real-time churn probability scoring powered by machine learning.",
  },
  {
    icon: (
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    title: "Outreach Hub",
    description: "Automated workflows to engage at-risk customers instantly.",
  },
];

export default function LoginLeftPanel() {
  return (
    <div
      className="relative flex flex-col pt-10 px-10 pb-10 text-white overflow-hidden h-full"
      style={{
        width: "360px",
        minWidth: "360px",
        background: "linear-gradient(160deg, #2563eb 0%, #1d4ed8 50%, #1e3a8a 100%)",
      }}
    >
      {/* Decorative background orbs */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full"
        style={{ background: "rgba(255,255,255,0.07)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-12 w-72 h-72 rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />

      {/* Content */}
      <div className="relative">
        <h2 className="text-3xl font-bold leading-tight mb-4">
          Predict risk before it happens.
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
          AI-powered churn prediction that helps you identify at-risk customers
          and take action before they leave.
        </p>
      </div>

      <div className="relative flex flex-col gap-5 mt-auto">
        {features.map((f) => (
          <div key={f.title} className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
            >
              {f.icon}
            </div>
            <div>
              <p className="font-semibold text-sm">{f.title}</p>
              <p className="text-xs leading-relaxed mt-0.5" style={{ color: "rgba(255,255,255,0.68)" }}>
                {f.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

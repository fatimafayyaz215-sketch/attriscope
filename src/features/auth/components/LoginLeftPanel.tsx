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
      className="flex flex-col justify-between p-10 text-white"
      style={{ width: "340px", minWidth: "340px", background: "#1d4ed8", overflow: "hidden" }}
    >
      <div>
        <h2 className="text-3xl font-bold leading-tight mb-4">
          Predict risk before it happens.
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
          Join over 500+ enterprise companies using ChurnIQ to automate
          customer retention and secure recurring revenue.
        </p>
      </div>

      <div className="flex flex-col gap-5 mt-10">
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
              <p className="text-xs leading-relaxed mt-0.5" style={{ color: "rgba(255,255,255,0.70)" }}>
                {f.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

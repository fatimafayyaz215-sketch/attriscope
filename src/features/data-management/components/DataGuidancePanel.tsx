import Image from "next/image";

export default function DataGuidancePanel({ dashboardMockupPath }: { dashboardMockupPath: string }) {
  const guidanceItems = [
    { title: "UTF-8 Encoding", desc: "Ensure your CSV is encoded in UTF-8 to prevent character corruption." },
    { title: "Header Row Required", desc: "The first row must contain column names for mapping." },
    { title: "Date Formats", desc: "Use ISO-8601 (YYYY-MM-DD) for best results with time-series analysis." },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Format Guidance Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-base font-bold text-gray-900">Format Guidance</h2>
        </div>
        
        <ul className="flex flex-col gap-5">
          {guidanceItems.map((item, i) => (
            <li key={i} className="flex gap-4 items-start">
              <div className="text-emerald-500 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-0.5">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <a
          href="/saas-sample-customers.csv"
          download="saas-sample-customers.csv"
          className="w-full mt-6 flex items-center justify-center gap-2 text-blue-600 text-xs font-bold hover:underline"
        >
          Download SaaS Test CSV (500 customers)
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </a>
      </div>

      {/* Automated Sync Card */}
      {/* <div className="bg-[#eff6ff] border border-blue-100 rounded-xl p-6 shadow-sm relative overflow-hidden group">
        <div className="relative z-10">
          <h3 className="text-sm font-bold text-blue-900 mb-2">Automated Data Sync</h3>
          <p className="text-xs text-blue-700/80 leading-relaxed mb-5">
            Connect your CRM directly to avoid manual CSV uploads and get real-time churn predictions.
          </p>
          <button className="bg-white text-blue-700 px-4 py-2 rounded-lg text-[11px] font-bold shadow-sm hover:bg-blue-50 transition-colors">
            View Integrations
          </button>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
        </div>
      </div> */}

      {/* Pro Tip Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="h-40 bg-gray-100 overflow-hidden">
          <Image 
            src={dashboardMockupPath} 
            alt="Dashboard Mockup" 
            width={400}
            height={160}
            unoptimized
            className="w-full h-full object-cover grayscale-[0.5] hover:grayscale-0 transition-all duration-700" 
          />
        </div>
        <div className="p-5">
          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-2">Pro Tip</p>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            Mapping accurate MRR data increases prediction accuracy by up to 40%.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RiskIntelligencePanel() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Risk Intelligence</h2>
        <div className="text-blue-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6 flex-1">
        
        {/* Critical Risk Alert */}
        <div className="bg-[#fef2f2] border border-red-100 rounded-lg p-4 flex gap-4">
          <div className="flex-shrink-0 flex items-center justify-center bg-white border border-red-200 text-red-600 text-xl font-bold rounded-md w-12 h-12 shadow-sm">
            89
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-700 mb-0.5">Critical Risk Detected</h3>
            <p className="text-xs text-red-600/80 leading-relaxed">Acme Global Corp requires immediate outreach.</p>
          </div>
        </div>

        {/* AI Insights */}
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">AI Insights</h3>
          <div className="bg-[#f8fafc] border border-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-600 italic leading-relaxed">
              "User engagement has plummeted significantly. Primary stakeholders haven't logged in for 3 weeks, and API consumption dropped by 65% since last Tuesday. Sentiment analysis from the latest support tickets suggests frustration with recent downtime."
            </p>
          </div>
        </div>

        {/* Key Indicators */}
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Key Indicators</h3>
          <ul className="flex flex-col gap-3">
            
            <li className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login Frequency
              </div>
              <span className="font-bold text-red-600">-88%</span>
            </li>
            
            <li className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Open Tickets
              </div>
              <span className="font-bold text-amber-500">4 Active</span>
            </li>
            
            <li className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600 font-medium">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Payment Status
              </div>
              <span className="font-bold text-emerald-500">Paid</span>
            </li>

          </ul>
        </div>

      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-100 flex flex-col gap-3">
        <button className="w-full bg-[#0a235c] hover:bg-[#071944] text-white font-medium py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Schedule Outreach
        </button>
        <button className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold py-3 rounded-lg text-sm transition-colors shadow-sm">
          View Full History
        </button>
      </div>

    </div>
  );
}

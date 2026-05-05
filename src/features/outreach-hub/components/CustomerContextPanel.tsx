export default function CustomerContextPanel() {
  return (
    <div className="flex flex-col gap-6">
      
      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <img 
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d" 
              alt="Avatar" 
              className="w-12 h-12 rounded-lg object-cover" 
            />
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">Acme Corp.</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Enterprise Tier</p>
            </div>
          </div>
          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest text-center leading-tight">
            High<br/>Risk
          </span>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            <span>Churn Probability</span>
            <span className="text-red-600 text-sm">82%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 w-[82%]"></div>
          </div>
        </div>

        <div className="flex justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ARR Risk</p>
            <p className="text-lg font-bold text-gray-900">$124,500</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tenure</p>
            <p className="text-lg font-bold text-gray-900">3.4 yrs</p>
          </div>
        </div>

      </div>

      {/* Risk Factors Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">Risk Factors</h3>
        
        <ul className="flex flex-col gap-6">
          <li className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Decreased Seat Usage</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Active seat usage dropped by 45% in the last 30 days.</p>
            </div>
          </li>

          <li className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Unresolved Support Issues</h4>
              <p className="text-xs text-gray-500 leading-relaxed">2 high-priority tickets remaining open for &gt; 15 days.</p>
            </div>
          </li>

          <li className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Contract Expiry</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Renewal window opens in 45 days.</p>
            </div>
          </li>
        </ul>
      </div>

      {/* Recent Activity Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent Activity</h3>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        <div className="relative pl-6 border-l-2 border-gray-100 flex flex-col gap-6">
          <div className="relative">
            <div className="absolute -left-[29px] top-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-full"></div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Oct 12, 2023</p>
            <p className="text-sm font-medium text-gray-800">Outreach Hub draft generated by AI</p>
          </div>
          
          <div className="relative">
            <div className="absolute -left-[29px] top-1 w-3 h-3 bg-white border-2 border-gray-300 rounded-full"></div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Oct 10, 2023</p>
            <p className="text-sm text-gray-500">Support Ticket #4928 closed</p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default function RiskDistributionChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-base font-bold text-gray-900">Risk Distribution</h2>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex items-end justify-between px-6 pb-6 border-b border-gray-100 min-h-[200px] gap-4">
        
        {/* High Bar */}
        <div className="w-1/3 flex flex-col items-center gap-3">
          <div className="w-full bg-[#E53E3E] rounded-t-sm h-[55%] relative group transition-all hover:opacity-90"></div>
          <span className="text-xs font-semibold text-gray-600">High</span>
        </div>

        {/* Med Bar */}
        <div className="w-1/3 flex flex-col items-center gap-3">
          <div className="w-full bg-[#D69E2E] rounded-t-sm h-[40%] relative group transition-all hover:opacity-90"></div>
          <span className="text-xs font-semibold text-gray-600">Med</span>
        </div>

        {/* Low Bar */}
        <div className="w-1/3 flex flex-col items-center gap-3">
          <div className="w-full bg-[#148E7F] rounded-t-sm h-[90%] relative group transition-all hover:opacity-90"></div>
          <span className="text-xs font-semibold text-gray-600">Low</span>
        </div>

      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span className="font-medium">Total Tracked</span>
        <span className="font-bold text-gray-900">12,482 Customers</span>
      </div>
    </div>
  );
}

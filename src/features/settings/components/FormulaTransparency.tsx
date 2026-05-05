export default function FormulaTransparency() {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Live Predictive Engine Card */}
      <div className="bg-[#0f172a] rounded-xl p-8 flex flex-col h-full shadow-lg">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-6 h-6 bg-blue-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</div>
          <h2 className="text-sm font-bold text-white">Formula Transparency</h2>
        </div>

        <div className="flex-1 flex flex-col gap-8">
          <div>
            <h3 className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mb-4">Live Predictive Engine</h3>
            <ul className="flex flex-col gap-6">
              <li className="flex justify-between items-center text-xs">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-tighter">Variable 1</p>
                  <p className="text-gray-500 font-mono">Inactive_Days(x)</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-[10px] uppercase">Weight</p>
                  <p className="text-blue-400 font-bold text-lg">x 0.30</p>
                </div>
              </li>
              <li className="flex justify-between items-center text-xs">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-tighter">Variable 2</p>
                  <p className="text-gray-500 font-mono">Engage_Freq(y)</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-[10px] uppercase">Weight</p>
                  <p className="text-amber-400 font-bold text-lg">x 0.45</p>
                </div>
              </li>
              <li className="flex justify-between items-center text-xs">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-tighter">Variable 3</p>
                  <p className="text-gray-500 font-mono">Support_Load(z)</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-[10px] uppercase">Weight</p>
                  <p className="text-teal-400 font-bold text-lg">x 0.25</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="pt-8 border-t border-gray-800">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Current Scoring Formula</p>
            <div className="bg-[#1e293b] rounded-lg p-4 font-mono text-sm text-blue-300 border border-blue-900/50">
              RiskScore = (0.30 * x) + (0.45 * y) + (0.25 * z)
            </div>
          </div>
        </div>

        <button className="w-full mt-8 bg-[#2548B4] hover:bg-blue-800 text-white font-bold py-3.5 rounded-lg text-sm transition-colors shadow-lg">
          Deploy Calibration
        </button>
      </div>

      {/* Impact Analysis Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-amber-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
          <h3 className="text-sm font-bold text-gray-900">Impact Analysis</h3>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          Based on this tuning, your "At Risk" segment will grow by approximately <span className="text-red-600 font-bold">12%</span> but increase forecast accuracy by <span className="text-teal-600 font-bold">8.4%</span>.
        </p>
        <button className="text-blue-600 text-xs font-bold hover:underline flex items-center gap-1">
          View simulation report
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </button>
      </div>
    </div>
  );
}

export default function DataImportWorkspace() {
  const mappingRows = [
    { source: "customer_id", example: "C-9012", target: "Account Identifier", status: "Matched", statusColor: "text-emerald-700 bg-emerald-50" },
    { source: "last_login", example: "2023-10-24", target: "Last Activity Date", status: "Matched", statusColor: "text-emerald-700 bg-emerald-50" },
    { source: "plan_type", example: "Enterprise", target: "Subscription Tier", status: "Review Needed", statusColor: "text-amber-700 bg-amber-50" },
    { source: "mrr_value", example: "$4,500", target: "Monthly Recurring Revenue", status: "Matched", statusColor: "text-emerald-700 bg-emerald-50" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Import Customer Data</h1>
        <p className="text-sm text-gray-500">
          Upload your CSV files to synchronize customer profiles with ChurnGuard AI&apos;s risk engine.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-colors hover:border-blue-400 group">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Drag and drop your CSV file</h3>
        <p className="text-sm text-gray-500 mb-6">Or click to browse your computer. Maximum file size: 50MB.</p>
        <button className="px-8 py-3 bg-[#0a235c] text-white rounded-lg font-bold text-sm hover:bg-[#071944] transition-colors shadow-sm">
          Select CSV File
        </button>
      </div>

      {/* Mapping Table Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Map Columns</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            4 AI Mapped Fields
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source Column (CSV)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mapping Target</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mappingRows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{row.source}</span>
                      <span className="text-[10px] text-gray-400 font-mono">&quot;{row.example}&quot;</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative max-w-[240px]">
                      <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        <option>{row.target}</option>
                        <option>Alternative Field</option>
                        <option>Ignore Column</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-4 bg-gray-50/30">
          <button className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
          <button className="px-6 py-2.5 bg-[#0a235c] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#071944] transition-colors">
            Process Data
          </button>
        </div>
      </div>
    </div>
  );
}

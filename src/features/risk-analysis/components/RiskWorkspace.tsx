import Image from "next/image";

export default function RiskWorkspace() {
  const customers = [
    {
      id: 1,
      name: "Acme Global Corp",
      plan: "Enterprise Plan",
      avatar: "https://i.pravatar.cc/150?u=1",
      score: 89,
      scoreColor: "bg-red-600",
      level: "HIGH",
      levelColor: "text-red-600 bg-red-50",
      trend: "+12%",
      trendColor: "text-red-600",
      trendIcon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    },
    {
      id: 2,
      name: "Stellar Systems",
      plan: "Premium Tier",
      avatar: "https://i.pravatar.cc/150?u=2",
      score: 42,
      scoreColor: "bg-amber-500",
      level: "MED",
      levelColor: "text-amber-600 bg-amber-50",
      trend: "-2%",
      trendColor: "text-emerald-500",
      trendIcon: "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
    },
    {
      id: 3,
      name: "North Star Logistics",
      plan: "Basic Tier",
      avatar: "https://i.pravatar.cc/150?u=3",
      score: 14,
      scoreColor: "bg-teal-500",
      level: "LOW",
      levelColor: "text-teal-700 bg-teal-50",
      trend: "-8%",
      trendColor: "text-emerald-500",
      trendIcon: "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
    },
    {
      id: 4,
      name: "Velocity Retail",
      plan: "Enterprise Plan",
      avatar: "https://i.pravatar.cc/150?u=4",
      score: 76,
      scoreColor: "bg-red-600",
      level: "HIGH",
      levelColor: "text-red-600 bg-red-50",
      trend: "+24%",
      trendColor: "text-red-600",
      trendIcon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Risk Analysis Workspace</h1>
          <p className="text-sm text-gray-500">Real-time predictive scoring across your enterprise client base.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer Name</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Risk Score</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Risk Level</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.map((c, i) => (
              <tr key={c.id} className={i === 0 ? "bg-blue-50/30" : "hover:bg-gray-50/50 transition-colors"}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <Image src={c.avatar} alt={c.name} width={40} height={40} unoptimized className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                    <div>
                      <div className="font-bold text-gray-900">{c.name}</div>
                      <div className="text-[11px] text-gray-500">{c.plan}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                      <div className={`h-full ${c.scoreColor}`} style={{ width: `${c.score}%` }}></div>
                    </div>
                    <span className={`font-bold ${c.score >= 70 ? 'text-red-600' : c.score >= 40 ? 'text-amber-500' : 'text-teal-600'}`}>
                      {c.score}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full tracking-wider ${c.levelColor}`}>
                    {c.level}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className={`flex items-center justify-end gap-1.5 font-bold ${c.trendColor}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={c.trendIcon} />
                    </svg>
                    {c.trend}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Total High Risk</h3>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold text-red-600">24</div>
            <div className="text-xs font-bold text-red-600 pb-1">
              +4 from yesterday
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Churn Probability</h3>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold text-gray-900">18.2%</div>
            <div className="text-xs font-bold text-teal-600 pb-1">
              -1.2% this month
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Revenue At Risk</h3>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-bold text-gray-900">$1.4M</div>
            <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest pb-1.5">
              Critical
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

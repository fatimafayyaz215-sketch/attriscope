export default function HighPriorityAlertsTable() {
  const alerts = [
    {
      id: 1,
      customer: "Acme Solutions",
      tier: "Tier 1 Enterprise",
      initials: "AS",
      color: "bg-blue-100 text-blue-700",
      riskLevel: "CRITICAL RISK",
      riskColor: "text-red-600 bg-red-50",
      factor: "Usage Drop (72%)",
      engagementFill: "w-[15%] bg-red-500",
      ltv: "$124,500"
    },
    {
      id: 2,
      customer: "Nexus Labs",
      tier: "SMB Scale",
      initials: "NL",
      color: "bg-green-100 text-green-700",
      riskLevel: "ELEVATED RISK",
      riskColor: "text-amber-600 bg-amber-50",
      factor: "Support Volume",
      engagementFill: "w-[40%] bg-amber-500",
      ltv: "$42,200"
    },
    {
      id: 3,
      customer: "Global Forward",
      tier: "Tier 2 Mid-Market",
      initials: "GF",
      color: "bg-gray-100 text-gray-700",
      riskLevel: "CRITICAL RISK",
      riskColor: "text-red-600 bg-red-50",
      factor: "Inactivity (14d)",
      engagementFill: "w-[10%] bg-red-500",
      ltv: "$88,100"
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">High Priority Alerts</h2>
        <button className="text-xs font-bold text-blue-700 hover:underline">View All History</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Customer</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Risk Level</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Primary Factor</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Engagement</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">LTV</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {alerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${alert.color}`}>
                      {alert.initials}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{alert.customer}</div>
                      <div className="text-[11px] text-gray-500">{alert.tier}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider ${alert.riskColor}`}>
                    {alert.riskLevel}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 font-medium">
                  {alert.factor}
                </td>
                <td className="px-6 py-4">
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${alert.engagementFill}`}></div>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-gray-900">
                  {alert.ltv}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-xs font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 px-4 py-1.5 rounded transition-colors shadow-sm">
                    Intervene
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex justify-center">
        <button className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
          Show More Records
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

    </div>
  );
}

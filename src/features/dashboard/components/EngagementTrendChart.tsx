export default function EngagementTrendChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-gray-900">Engagement Trend</h2>
          <p className="text-xs text-gray-500 mt-1">Average daily sessions per customer</p>
        </div>
        
        <div className="flex bg-gray-100 rounded-lg p-1 mt-4 md:mt-0 self-start">
          <button className="px-3 py-1 text-xs font-semibold text-gray-500 rounded-md hover:text-gray-900 transition-colors">1W</button>
          <button className="px-3 py-1 text-xs font-semibold bg-[#2548B4] text-white rounded-md shadow-sm">1M</button>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="flex-1 relative min-h-[200px] w-full bg-gray-50/50 rounded-lg border border-gray-100 p-4 pb-8 flex flex-col justify-end">
        
        {/* Background Grid Lines (Horizontal) */}
        <div className="absolute inset-x-4 top-4 bottom-8 flex flex-col justify-between pointer-events-none">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-px bg-gray-200"></div>
          ))}
        </div>

        {/* The curved line */}
        <div className="absolute inset-x-4 top-4 bottom-8">
           <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 200">
             {/* Gradient fill under the line */}
             <defs>
               <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#4A72FF" stopOpacity="0.2" />
                 <stop offset="100%" stopColor="#4A72FF" stopOpacity="0" />
               </linearGradient>
             </defs>
             <path 
               d="M 0,20 C 300,20 400,100 700,140 C 850,160 950,120 1000,100 L 1000,200 L 0,200 Z" 
               fill="url(#blueGradient)" 
             />
             <path 
               d="M 0,20 C 300,20 400,100 700,140 C 850,160 950,120 1000,100" 
               fill="none" 
               stroke="#4A72FF" 
               strokeWidth="4" 
               strokeLinecap="round" 
               className="drop-shadow-sm"
             />
           </svg>
        </div>

        {/* X Axis Labels */}
        <div className="absolute bottom-2 inset-x-4 flex justify-between text-[10px] font-semibold text-gray-400">
          <span>Week 1</span>
          <span>Week 2</span>
          <span>Week 3</span>
          <span>Week 4</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
        <p className="text-xs font-bold text-red-500">~14% decrease in session frequency over 30 days.</p>
      </div>
    </div>
  );
}

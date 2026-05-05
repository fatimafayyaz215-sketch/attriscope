export default function SettingsFooter() {
  return (
    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-8">
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Last Calibration</p>
          <p className="text-xs font-bold text-gray-700">Oct 12, 2023 • 14:20 GMT</p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Auto-Tuning</p>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider">Enabled</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
          Reset to Default
        </button>
        <button className="px-8 py-2.5 bg-[#1e293b] hover:bg-black text-white rounded-lg text-sm font-bold transition-colors shadow-sm">
          Save Draft
        </button>
      </div>
    </div>
  );
}

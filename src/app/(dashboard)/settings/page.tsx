import IndustrySelector from "@/features/settings/components/IndustrySelector";
import WeightTuning from "@/features/settings/components/WeightTuning";
import FormulaTransparency from "@/features/settings/components/FormulaTransparency";
import SettingsFooter from "@/features/settings/components/SettingsFooter";

export default function SettingsPage() {
  return (
    <div className="max-w-[1500px] mx-auto w-full">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3">
          <span>Settings</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-400">Calibration & Setup</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Industry Context Calibration</h1>
        <p className="text-sm text-gray-500 max-w-2xl">
          Adjust the AI's predictive weights based on your specific business model. Sector-specific calibrations optimize for different churn patterns.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="flex flex-col gap-10">
        
        {/* Section 1: Industry */}
        <IndustrySelector />

        {/* Section 2 & 3: Tuning and Formula */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[65%]">
            <WeightTuning />
          </div>
          <div className="w-full lg:w-[35%]">
            <FormulaTransparency />
          </div>
        </div>

        {/* Footer Actions */}
        <SettingsFooter />

      </div>
    </div>
  );
}

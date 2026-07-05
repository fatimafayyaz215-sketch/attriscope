import { Suspense } from "react";
import RiskWorkspace from "@/features/risk-analysis/components/RiskWorkspace";
import RiskIntelligencePanel from "@/features/risk-analysis/components/RiskIntelligencePanel";

export default function RiskAnalysisPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1500px] mx-auto w-full min-w-0">
      <div className="w-full min-w-0 lg:w-[68%]">
        <Suspense fallback={<div className="h-96 bg-white rounded-xl border border-gray-200 animate-pulse" />}>
          <RiskWorkspace />
        </Suspense>
      </div>
      <div className="w-full min-w-0 lg:w-[32%] lg:sticky lg:top-[88px] lg:h-[calc(100vh-100px)]">
        <RiskIntelligencePanel />
      </div>
    </div>
  );
}

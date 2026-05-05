import RiskWorkspace from "@/features/risk-analysis/components/RiskWorkspace";
import RiskIntelligencePanel from "@/features/risk-analysis/components/RiskIntelligencePanel";

export default function RiskAnalysisPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1500px] mx-auto w-full">
      <div className="w-full lg:w-[68%]">
        <RiskWorkspace />
      </div>
      <div className="w-full lg:w-[32%] lg:sticky lg:top-[88px] h-[calc(100vh-100px)]">
        <RiskIntelligencePanel />
      </div>
    </div>
  );
}

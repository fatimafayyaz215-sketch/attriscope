import DataImportWorkspace from "@/features/data-management/components/DataImportWorkspace";
import DataGuidancePanel from "@/features/data-management/components/DataGuidancePanel";

export default function DataManagementPage() {
  // Use the generated image path
  const dashboardMockupPath = "/dashboard_pro_tip_mockup_1777983351522.png";

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1500px] mx-auto w-full">
      <div className="w-full lg:w-[68%]">
        <DataImportWorkspace />
      </div>
      <div className="w-full lg:w-[32%] lg:min-w-[320px]">
        <DataGuidancePanel dashboardMockupPath={dashboardMockupPath} />
      </div>
    </div>
  );
}

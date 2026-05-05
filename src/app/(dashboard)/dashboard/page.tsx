import StatCards from "@/features/dashboard/components/StatCards";
import RiskDistributionChart from "@/features/dashboard/components/RiskDistributionChart";
import EngagementTrendChart from "@/features/dashboard/components/EngagementTrendChart";
import HighPriorityAlertsTable from "@/features/dashboard/components/HighPriorityAlertsTable";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
      <StatCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RiskDistributionChart />
        </div>
        <div className="lg:col-span-2">
          <EngagementTrendChart />
        </div>
      </div>

      <HighPriorityAlertsTable />
    </div>
  );
}

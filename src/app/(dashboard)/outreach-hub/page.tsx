import { Suspense } from "react";
import CustomerContextPanel from "@/features/outreach-hub/components/CustomerContextPanel";
import EmailEditorPanel from "@/features/outreach-hub/components/EmailEditorPanel";

export default function OutreachHubPage() {
  return (
    <Suspense>
      <div className="flex flex-col lg:flex-row gap-8 max-w-[1500px] mx-auto w-full">
        <div className="w-full lg:w-[32%] lg:min-w-[320px]">
          <CustomerContextPanel />
        </div>
        <div className="w-full lg:w-[68%]">
          <EmailEditorPanel />
        </div>
      </div>
    </Suspense>
  );
}

import { Suspense } from "react";
import OutreachHubWorkspace from "@/features/outreach-hub/components/OutreachHubWorkspace";

export default function OutreachHubPage() {
  return (
    <Suspense>
      <OutreachHubWorkspace />
    </Suspense>
  );
}

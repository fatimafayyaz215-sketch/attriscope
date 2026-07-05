"use client";

import { useRef } from "react";
import CustomerContextPanel from "@/features/outreach-hub/components/CustomerContextPanel";
import EmailEditorPanel from "@/features/outreach-hub/components/EmailEditorPanel";
import DraftsModal, { type DraftsModalHandle } from "@/features/outreach-hub/components/DraftsModal";

export default function OutreachHubWorkspace() {
  const draftsModalRef = useRef<DraftsModalHandle>(null);
  const draftDeleteHandlerRef = useRef<(customerId: string) => void>(() => {});

  return (
    <>
      <DraftsModal
        ref={draftsModalRef}
        onDraftDeleted={(customerId) => draftDeleteHandlerRef.current(customerId)}
      />

      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-8 lg:flex-row">
        <div className="w-full lg:w-[32%] lg:min-w-[320px]">
          <CustomerContextPanel />
        </div>
        <div className="w-full lg:w-[68%]">
          <EmailEditorPanel
            onViewDrafts={() => draftsModalRef.current?.show()}
            onRegisterDraftDeleteHandler={(handler) => {
              draftDeleteHandlerRef.current = handler;
            }}
          />
        </div>
      </div>
    </>
  );
}

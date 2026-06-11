import { Suspense } from "react";
import PublicAuthShell from "@/features/auth/components/PublicAuthShell";
import ResetPasswordLeftPanel from "@/features/auth/components/ResetPasswordLeftPanel";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";

export const metadata = {
  title: "Reset Password — Attriscope",
  description: "Set a new password for your Attriscope account.",
};

export default function ResetPasswordPage() {
  return (
    <PublicAuthShell leftPanel={<ResetPasswordLeftPanel />} mdMinHeightClass="md:min-h-[520px]">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </PublicAuthShell>
  );
}

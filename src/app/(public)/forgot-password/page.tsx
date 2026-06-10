import PublicAuthShell from "@/features/auth/components/PublicAuthShell";
import ForgotPasswordLeftPanel from "@/features/auth/components/ForgotPasswordLeftPanel";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password — Attriscope",
  description: "Recover your Attriscope account.",
};

export default function ForgotPasswordPage() {
  return (
    <PublicAuthShell leftPanel={<ForgotPasswordLeftPanel />} mdMinHeightClass="md:min-h-[520px]">
      <ForgotPasswordForm />
    </PublicAuthShell>
  );
}

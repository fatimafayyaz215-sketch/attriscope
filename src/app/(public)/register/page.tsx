import PublicAuthShell from "@/features/auth/components/PublicAuthShell";
import LoginLeftPanel from "@/features/auth/components/LoginLeftPanel";
import RegisterForm from "@/features/auth/components/RegisterForm";

export const metadata = {
  title: "Create an Account — Attriscope",
  description: "Start your 14-day free trial. No credit card required.",
};

export default function RegisterPage() {
  return (
    <PublicAuthShell leftPanel={<LoginLeftPanel />} mdMinHeightClass="md:min-h-[600px]">
      <RegisterForm />
    </PublicAuthShell>
  );
}

import PublicAuthShell from "@/features/auth/components/PublicAuthShell";
import LoginLeftPanel from "@/features/auth/components/LoginLeftPanel";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata = {
  title: "Sign In — Attriscope",
  description: "Sign in to your Attriscope account to monitor and prevent customer attrition.",
};

export default function LoginPage() {
  return (
    <PublicAuthShell leftPanel={<LoginLeftPanel />}>
      <LoginForm />
    </PublicAuthShell>
  );
}

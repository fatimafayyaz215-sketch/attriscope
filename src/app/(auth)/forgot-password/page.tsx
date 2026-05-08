import ForgotPasswordLeftPanel from "@/features/auth/components/ForgotPasswordLeftPanel";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password — ChurnIQ",
  description: "Recover your ChurnIQ account.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel – hidden on small screens */}
      <div className="hidden md:block">
        <ForgotPasswordLeftPanel />
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 md:p-12">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

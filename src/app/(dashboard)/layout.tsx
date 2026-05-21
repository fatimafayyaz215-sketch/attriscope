import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import AppAssistantChatbot from "@/components/layout/AppAssistantChatbot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
      <AppAssistantChatbot />
    </div>
  );
}

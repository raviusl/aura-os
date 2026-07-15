import { AppSidebar } from "@/components/layout/app-sidebar";
import { AiAssistantPanel } from "@/components/layout/ai-assistant-panel";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh bg-[#070708] text-white">
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center justify-end border-b border-white/[0.06] px-6">
          <SignOutButton />
        </div>
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">{children}</main>
      </div>
      <div className="hidden xl:block">
        <AiAssistantPanel />
      </div>
    </div>
  );
}

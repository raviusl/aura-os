import { redirect } from "next/navigation";

import { resolveSessionContext } from "@/core/auth/context";
import { listCompaniesForUserInWorkspace } from "@/core/company/active-company";
import {
  listWorkspacesForUser,
  resolveActiveWorkspace,
} from "@/core/workspace/active-workspace";
import { CompanyContextProvider } from "@/features/company/components/company-context-provider";
import { CompanySwitcher } from "@/features/company/components/company-switcher";
import { WorkspaceSwitcher } from "@/features/workspace/components/workspace-switcher";
import {
  serializeSessionContext,
  toCompanyContextValue,
} from "@/features/company/lib/company-context";
import { getSessionUser } from "@/features/auth/lib/get-session-user";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AiAssistantPanel } from "@/components/layout/ai-assistant-panel";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const workspaces = await listWorkspacesForUser(user.id);
  const activeWorkspace = await resolveActiveWorkspace(user.id);
  const sessionContext = await resolveSessionContext(user.id);
  const companies = activeWorkspace
    ? await listCompaniesForUserInWorkspace(user.id, activeWorkspace.id)
    : [];

  const companyContextValue = toCompanyContextValue({
    context: sessionContext ? serializeSessionContext(sessionContext) : null,
    companies,
  });

  return (
    <CompanyContextProvider value={companyContextValue}>
      <div className="flex min-h-svh bg-[#070708] text-white">
        <div className="hidden lg:block">
          <AppSidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-14 items-center justify-between gap-3 border-b border-white/[0.06] px-6">
            <div className="flex min-w-0 items-center gap-2">
              <WorkspaceSwitcher
                workspaces={workspaces}
                activeWorkspace={activeWorkspace}
              />
              {activeWorkspace ? <CompanySwitcher /> : null}
            </div>
            <SignOutButton />
          </div>
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {children}
          </main>
        </div>
        <div className="hidden xl:block">
          <AiAssistantPanel />
        </div>
      </div>
    </CompanyContextProvider>
  );
}

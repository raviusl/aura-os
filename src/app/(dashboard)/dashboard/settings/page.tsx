import Link from "next/link";

import { Bilingual } from "@/components/ui/bilingual";
import { getSessionIsSuperAdmin } from "@/features/auth/lib/require-super-admin-page";

export default async function SettingsPage() {
  const isSuperAdmin = await getSessionIsSuperAdmin();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div>
        <Bilingual
          text={{ zh: "设置", en: "Settings" }}
          zhClassName="text-xl text-white"
          enClassName="text-white/40"
        />
        <p className="mt-2 text-sm text-white/45">
          Workspace, company, and membership preferences.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          href="/dashboard/settings/workspace"
          className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
        >
          <p className="text-sm font-medium text-white">Workspace</p>
          <p className="mt-1 text-xs text-white/45">
            Name, logo, timezone, country, currency, and status.
          </p>
        </Link>

        <Link
          href="/dashboard/settings/company"
          className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
        >
          <p className="text-sm font-medium text-white">Company</p>
          <p className="mt-1 text-xs text-white/45">
            Active company settings and status.
          </p>
        </Link>

        <Link
          href="/dashboard/workspaces"
          className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
        >
          <p className="text-sm font-medium text-white">Workspaces</p>
          <p className="mt-1 text-xs text-white/45">
            List, create, and switch workspaces.
          </p>
        </Link>

        <Link
          href="/dashboard/companies"
          className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
        >
          <p className="text-sm font-medium text-white">Companies</p>
          <p className="mt-1 text-xs text-white/45">
            List and create companies in the active workspace.
          </p>
        </Link>

        <Link
          href="/dashboard/settings/members"
          className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
        >
          <p className="text-sm font-medium text-white">Members</p>
          <p className="mt-1 text-xs text-white/45">
            Invite people and manage membership roles.
          </p>
        </Link>

        {isSuperAdmin ? (
          <Link
            href="/dashboard/settings/users"
            className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
          >
            <p className="text-sm font-medium text-white">User Management</p>
            <p className="mt-1 text-xs text-white/45">
              Platform users and invitations. Super Admin only.
            </p>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

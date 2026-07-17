import Link from "next/link";

import { Bilingual } from "@/components/ui/bilingual";
import { getSessionIsSuperAdmin } from "@/features/auth/lib/require-super-admin-page";

export default async function SettingsPage() {
  const isSuperAdmin = await getSessionIsSuperAdmin();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div>
        <Bilingual
          text={{ zh: "系统设置", en: "Settings" }}
          zhClassName="text-xl text-white"
          enClassName="text-white/40"
        />
        <p className="mt-2 text-sm text-white/45">
          Workspace preferences and administration.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          href="/dashboard/projects"
          className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
        >
          <p className="text-sm font-medium text-white">Projects</p>
          <p className="mt-1 text-xs text-white/45">
            Create and manage projects scoped to the active company.
          </p>
        </Link>

        <Link
          href="/dashboard/settings/company"
          className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
        >
          <p className="text-sm font-medium text-white">Company</p>
          <p className="mt-1 text-xs text-white/45">
            Name, type, logo, timezone, country, currency, and status.
          </p>
        </Link>

        <Link
          href="/dashboard/companies"
          className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
        >
          <p className="text-sm font-medium text-white">Companies</p>
          <p className="mt-1 text-xs text-white/45">
            List, create, and switch between companies in the active workspace.
          </p>
        </Link>

        <Link
          href="/dashboard/settings/workspace"
          className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
        >
          <p className="text-sm font-medium text-white">Workspace</p>
          <p className="mt-1 text-xs text-white/45">
            Name, logo, timezone, country, currency, locale, and status.
          </p>
        </Link>

        <Link
          href="/dashboard/settings/members"
          className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
        >
          <p className="text-sm font-medium text-white">Members</p>
          <p className="mt-1 text-xs text-white/45">
            Invite people, manage roles, and membership status.
          </p>
        </Link>

        <Link
          href="/dashboard/workspaces"
          className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
        >
          <p className="text-sm font-medium text-white">Workspaces</p>
          <p className="mt-1 text-xs text-white/45">
            List, create, and switch between workspaces you belong to.
          </p>
        </Link>

        {isSuperAdmin ? (
          <Link
            href="/dashboard/settings/users"
            className="block rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05]"
          >
            <p className="text-sm font-medium text-white">User Management</p>
            <p className="mt-1 text-xs text-white/45">
              Manage users, send invitations, resend expired invites, and cancel
              pending ones. Super Admin only.
            </p>
          </Link>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/[0.08] px-5 py-4">
            <p className="text-sm text-white/55">
              User Management is available to Super Admins only.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

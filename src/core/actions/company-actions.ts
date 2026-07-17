"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUserId } from "@/core/auth/session";
import {
  archiveCompany,
  createCompany,
  restoreCompany,
  suspendCompany,
  updateCompanySettings,
} from "@/core/company/company";
import { setActiveCompanyIdCookie } from "@/core/company/active-company";
import { toCoreUserMessage } from "@/core/errors";
import { createMembership } from "@/core/membership/memberships";
import { requirePersonPermission } from "@/core/people/people";
import type {
  CompanyIdInput,
  CreateCompanyInput,
  UpdateCompanySettingsInput,
} from "@/core/schemas";
import { getSessionUser } from "@/features/auth/lib/get-session-user";

export type CompanyActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateCompanyPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/companies");
  revalidatePath("/dashboard/settings/company");
  revalidatePath("/dashboard/select-company");
}

export async function createCompanyAction(
  input: CreateCompanyInput,
): Promise<CompanyActionResult<{ companyId: string; slug: string }>> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { ok: false, error: "You must be signed in." };
    }

    const email = user.email?.trim().toLowerCase();
    if (!email) {
      return {
        ok: false,
        error: "Your account needs an email address to create a company.",
      };
    }

    await requirePersonPermission(user.id, input.workspaceId, "company.write");
    const company = await createCompany(input);

    const fullName =
      (typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null) ||
      email.split("@")[0] ||
      "Member";

    await createMembership({
      userId: user.id,
      workspaceId: input.workspaceId,
      companyId: company.id,
      roleKey: "admin",
      email,
      fullName,
      status: "accepted",
    });

    await setActiveCompanyIdCookie(company.id);
    revalidateCompanyPaths();

    return {
      ok: true,
      data: { companyId: company.id, slug: company.slug },
    };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to create company"),
    };
  }
}

export async function updateCompanySettingsAction(
  input: UpdateCompanySettingsInput,
): Promise<CompanyActionResult<{ companyId: string }>> {
  try {
    const userId = await requireSessionUserId();
    const { requireMembershipPermission } = await import(
      "@/core/membership/memberships"
    );
    await requireMembershipPermission(
      userId,
      input.workspaceId,
      input.companyId,
      "company.write",
    );
    const company = await updateCompanySettings(input);
    revalidateCompanyPaths();
    return { ok: true, data: { companyId: company.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to update company"),
    };
  }
}

export async function archiveCompanyAction(
  input: CompanyIdInput,
): Promise<CompanyActionResult<{ companyId: string }>> {
  try {
    const userId = await requireSessionUserId();
    const { requireMembershipPermission } = await import(
      "@/core/membership/memberships"
    );
    await requireMembershipPermission(
      userId,
      input.workspaceId,
      input.companyId,
      "company.write",
    );
    const company = await archiveCompany(input);
    revalidateCompanyPaths();
    return { ok: true, data: { companyId: company.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to archive company"),
    };
  }
}

export async function restoreCompanyAction(
  input: CompanyIdInput,
): Promise<CompanyActionResult<{ companyId: string }>> {
  try {
    const userId = await requireSessionUserId();
    const { requireMembershipPermission } = await import(
      "@/core/membership/memberships"
    );
    await requireMembershipPermission(
      userId,
      input.workspaceId,
      input.companyId,
      "company.write",
    );
    const company = await restoreCompany(input);
    revalidateCompanyPaths();
    return { ok: true, data: { companyId: company.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to restore company"),
    };
  }
}

export async function reactivateCompanyAction(
  input: CompanyIdInput,
): Promise<CompanyActionResult<{ companyId: string }>> {
  try {
    const userId = await requireSessionUserId();
    const { requireMembershipPermission } = await import(
      "@/core/membership/memberships"
    );
    await requireMembershipPermission(
      userId,
      input.workspaceId,
      input.companyId,
      "company.write",
    );
    const { reactivateCompany } = await import("@/core/company/company");
    const company = await reactivateCompany(input);
    revalidateCompanyPaths();
    return { ok: true, data: { companyId: company.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to reactivate company"),
    };
  }
}

export async function suspendCompanyAction(
  input: CompanyIdInput,
): Promise<CompanyActionResult<{ companyId: string }>> {
  try {
    const userId = await requireSessionUserId();
    const { requireMembershipPermission } = await import(
      "@/core/membership/memberships"
    );
    await requireMembershipPermission(
      userId,
      input.workspaceId,
      input.companyId,
      "company.write",
    );
    const company = await suspendCompany(input);
    revalidateCompanyPaths();
    return { ok: true, data: { companyId: company.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to suspend company"),
    };
  }
}

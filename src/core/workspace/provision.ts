import "server-only";

import { CoreError } from "@/core/errors";
import { createCompany } from "@/core/company/company";
import { setActiveCompanyIdCookie } from "@/core/company/active-company";
import { createMembership } from "@/core/membership/memberships";
import { createPerson } from "@/core/people/people";
import type { CreateWorkspaceInput } from "@/core/schemas";
import type { Company, MembershipRole, Workspace } from "@/core/types";
import { setActiveWorkspaceIdCookie } from "@/core/workspace/active-workspace";
import { createWorkspace } from "@/core/workspace/workspace";

export type ProvisionWorkspaceForUserInput = CreateWorkspaceInput & {
  ownerUserId: string;
  ownerEmail: string;
  ownerFullName: string;
  companyName?: string;
  companyType?: Company["type"];
};

/**
 * Product Blueprint provisioning:
 * Workspace (owner_id) → default Company → Founder membership
 */
export async function provisionWorkspaceForUser(
  input: ProvisionWorkspaceForUserInput,
): Promise<{
  workspace: Workspace;
  companyId: string;
  membershipId: string;
  personId: string;
}> {
  const email = input.ownerEmail.trim().toLowerCase();
  if (!email) {
    throw new CoreError(
      "OWNER_EMAIL_REQUIRED",
      "Owner email is required to create a workspace.",
    );
  }

  const workspace = await createWorkspace({
    name: input.name,
    slug: input.slug,
    timezone: input.timezone,
    locale: input.locale,
    currency: input.currency,
    country: input.country,
    logoUrl: input.logoUrl,
    status: input.status ?? "active",
    ownerId: input.ownerUserId,
  });

  const company = await createCompany({
    workspaceId: workspace.id,
    name: input.companyName?.trim() || workspace.name,
    type: input.companyType ?? "agency",
    timezone: workspace.timezone,
    locale: workspace.locale,
    currency: workspace.currency,
    country: workspace.country ?? undefined,
  });

  const { person } = await createPerson({
    workspaceId: workspace.id,
    companyId: company.id,
    email,
    fullName: input.ownerFullName.trim() || email,
    role: "founder" satisfies MembershipRole,
    userId: input.ownerUserId,
    status: "accepted",
  });

  const membership = await createMembership({
    userId: input.ownerUserId,
    workspaceId: workspace.id,
    companyId: company.id,
    roleKey: "founder",
    email,
    fullName: input.ownerFullName.trim() || email,
    status: "accepted",
    personId: person.id,
  });

  await setActiveWorkspaceIdCookie(workspace.id);
  await setActiveCompanyIdCookie(company.id);

  return {
    workspace,
    companyId: company.id,
    membershipId: membership.id,
    personId: person.id,
  };
}

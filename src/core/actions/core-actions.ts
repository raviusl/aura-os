"use server";

import { revalidatePath } from "next/cache";

import {
  acceptCoreInvitation,
  invitePerson,
} from "@/core/auth/invitation";
import { requireSessionUserId } from "@/core/auth/session";
import { createCompany } from "@/core/company/company";
import { toCoreUserMessage } from "@/core/errors";
import { assignRole, createPerson } from "@/core/people/people";
import { createProject } from "@/core/project/project";
import type {
  AcceptCoreInvitationInput,
  CreateCompanyInput,
  CreatePersonInput,
  CreateProjectInput,
  InvitePersonInput,
} from "@/core/schemas";
import type { CoreRole } from "@/core/types";

export type CoreActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function createCompanyAction(
  input: CreateCompanyInput,
): Promise<CoreActionResult<{ companyId: string }>> {
  try {
    const userId = await requireSessionUserId();
    const { requirePersonPermission } = await import("@/core/people/people");
    await requirePersonPermission(userId, input.workspaceId, "company.write");
    const company = await createCompany(input);
    return { ok: true, data: { companyId: company.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to create company"),
    };
  }
}

export async function createPersonAction(
  input: CreatePersonInput,
): Promise<CoreActionResult<{ personId: string }>> {
  try {
    const userId = await requireSessionUserId();
    const { requirePersonPermission } = await import("@/core/people/people");
    await requirePersonPermission(userId, input.workspaceId, "people.write");
    const { person } = await createPerson(input);
    return { ok: true, data: { personId: person.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to create person"),
    };
  }
}

export async function assignRoleAction(input: {
  workspaceId: string;
  personId: string;
  role: CoreRole;
}): Promise<CoreActionResult> {
  try {
    const userId = await requireSessionUserId();
    const { requirePersonPermission, getPersonById } = await import(
      "@/core/people/people"
    );
    await requirePersonPermission(
      userId,
      input.workspaceId,
      "people.assign_role",
    );
    const person = await getPersonById(input.personId);
    if (person.workspace_id !== input.workspaceId) {
      return {
        ok: false,
        error: "Person does not belong to this workspace.",
      };
    }
    await assignRole(input.personId, input.role);
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to assign role"),
    };
  }
}

export async function invitePersonAction(
  input: InvitePersonInput,
): Promise<
  CoreActionResult<{
    invitationId: string;
    personId: string;
    email: string;
    inviteUrl?: string;
    emailSent: boolean;
    expiresAt: string;
  }>
> {
  try {
    const userId = await requireSessionUserId();
    const result = await invitePerson(userId, input);
    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to invite person"),
    };
  }
}

export async function acceptCoreInvitationAction(
  input: AcceptCoreInvitationInput,
): Promise<
  CoreActionResult<{ signedIn: boolean; email: string; workspaceId: string }>
> {
  try {
    const result = await acceptCoreInvitation(input);
    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to accept invitation"),
    };
  }
}

export async function createProjectAction(
  input: CreateProjectInput,
): Promise<CoreActionResult<{ projectId: string }>> {
  try {
    const userId = await requireSessionUserId();
    const { requirePersonPermission } = await import("@/core/people/people");
    await requirePersonPermission(userId, input.workspaceId, "project.write");
    const project = await createProject(input);
    revalidatePath("/dashboard");
    return { ok: true, data: { projectId: project.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to create project"),
    };
  }
}

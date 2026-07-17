"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUserId } from "@/core/auth/session";
import { toCoreUserMessage } from "@/core/errors";
import { requirePersonPermission } from "@/core/people/people";
import type {
  CreateWorkspaceInput,
  SwitchWorkspaceInput,
  UpdateWorkspaceSettingsInput,
  WorkspaceIdInput,
} from "@/core/schemas";
import {
  switchActiveWorkspace,
} from "@/core/workspace/active-workspace";
import { provisionWorkspaceForUser } from "@/core/workspace/provision";
import {
  archiveWorkspace,
  restoreWorkspace,
  suspendWorkspace,
  updateWorkspaceSettings,
} from "@/core/workspace/workspace";
import { getSessionUser } from "@/features/auth/lib/get-session-user";

export type WorkspaceActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateWorkspacePaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/workspaces");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/workspace");
}

export async function createWorkspaceAction(
  input: CreateWorkspaceInput,
): Promise<WorkspaceActionResult<{ workspaceId: string; slug: string }>> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { ok: false, error: "You must be signed in." };
    }

    const email = user.email?.trim().toLowerCase();
    if (!email) {
      return {
        ok: false,
        error: "Your account needs an email address to create a workspace.",
      };
    }

    const fullName =
      (typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null) ||
      email.split("@")[0] ||
      "Owner";

    const { workspace } = await provisionWorkspaceForUser({
      ...input,
      ownerUserId: user.id,
      ownerEmail: email,
      ownerFullName: fullName,
    });

    revalidateWorkspacePaths();
    return {
      ok: true,
      data: { workspaceId: workspace.id, slug: workspace.slug },
    };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to create workspace"),
    };
  }
}

export async function updateWorkspaceSettingsAction(
  input: UpdateWorkspaceSettingsInput,
): Promise<WorkspaceActionResult<{ workspaceId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requirePersonPermission(
      userId,
      input.workspaceId,
      "workspace.write",
    );
    const workspace = await updateWorkspaceSettings(input);
    revalidateWorkspacePaths();
    return { ok: true, data: { workspaceId: workspace.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to update workspace"),
    };
  }
}

export async function archiveWorkspaceAction(
  input: WorkspaceIdInput,
): Promise<WorkspaceActionResult<{ workspaceId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requirePersonPermission(
      userId,
      input.workspaceId,
      "workspace.write",
    );
    const workspace = await archiveWorkspace(input.workspaceId);
    revalidateWorkspacePaths();
    return { ok: true, data: { workspaceId: workspace.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to archive workspace"),
    };
  }
}

export async function restoreWorkspaceAction(
  input: WorkspaceIdInput,
): Promise<WorkspaceActionResult<{ workspaceId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requirePersonPermission(
      userId,
      input.workspaceId,
      "workspace.write",
    );
    const workspace = await restoreWorkspace(input.workspaceId);
    revalidateWorkspacePaths();
    return { ok: true, data: { workspaceId: workspace.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to restore workspace"),
    };
  }
}

export async function suspendWorkspaceAction(
  input: WorkspaceIdInput,
): Promise<WorkspaceActionResult<{ workspaceId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requirePersonPermission(
      userId,
      input.workspaceId,
      "workspace.write",
    );
    const workspace = await suspendWorkspace(input.workspaceId);
    revalidateWorkspacePaths();
    return { ok: true, data: { workspaceId: workspace.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to suspend workspace"),
    };
  }
}

export async function switchWorkspaceAction(
  input: SwitchWorkspaceInput,
): Promise<WorkspaceActionResult<{ workspaceId: string }>> {
  try {
    const userId = await requireSessionUserId();
    const workspace = await switchActiveWorkspace(userId, input.workspaceId);
    revalidateWorkspacePaths();
    return { ok: true, data: { workspaceId: workspace.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to switch workspace"),
    };
  }
}

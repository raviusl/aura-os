import "server-only";

import { CoreError } from "@/core/errors";
import { requireSlug } from "@/core/lib/slug";
import {
  createWorkspaceSchema,
  updateWorkspaceSettingsSchema,
  workspaceIdSchema,
  type CreateWorkspaceInput,
  type UpdateWorkspaceSettingsInput,
} from "@/core/schemas";
import type { Workspace, WorkspaceStatus } from "@/core/types";
import { createAdminClient } from "@/lib/supabase/admin";

export type { CreateWorkspaceInput, UpdateWorkspaceSettingsInput };

const EDITABLE_STATUSES: WorkspaceStatus[] = [
  "pending",
  "active",
  "suspended",
];

function mapWorkspaceRow(row: Record<string, unknown>): Workspace {
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    status: row.status as WorkspaceStatus,
    timezone: row.timezone as string,
    locale: row.locale as string,
    currency: row.currency as string,
    country: (row.country as string | null | undefined) ?? null,
    logo_url: (row.logo_url as string | null | undefined) ?? null,
    custom_domain: (row.custom_domain as string | null | undefined) ?? null,
    owner_id: (row.owner_id as string | null | undefined) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

function assertEditable(workspace: Workspace): void {
  if (!EDITABLE_STATUSES.includes(workspace.status)) {
    throw new CoreError(
      "WORKSPACE_NOT_EDITABLE",
      "Archived workspaces cannot be edited. Restore the workspace first.",
    );
  }
}

export async function createWorkspace(
  input: CreateWorkspaceInput & { ownerId?: string | null },
): Promise<Workspace> {
  const values = createWorkspaceSchema.parse(input);
  const admin = createAdminClient();
  const slug = requireSlug(values.slug ?? values.name, "workspace slug");

  const { data, error } = await admin
    .from("workspaces")
    .insert({
      name: values.name.trim(),
      slug,
      status: (values.status ?? "active") satisfies WorkspaceStatus,
      timezone: values.timezone ?? "UTC",
      locale: values.locale ?? "en",
      currency: (values.currency ?? "USD").toUpperCase(),
      country: values.country ? values.country.toUpperCase() : null,
      logo_url: values.logoUrl?.trim() || null,
      custom_domain: null,
      owner_id: input.ownerId ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      throw new CoreError(
        "WORKSPACE_SLUG_TAKEN",
        "A workspace with this slug already exists.",
      );
    }
    console.error("createWorkspace failed", error?.message);
    throw new CoreError(
      "WORKSPACE_CREATE_FAILED",
      "Failed to create workspace.",
    );
  }

  return mapWorkspaceRow(data as Record<string, unknown>);
}

export async function getWorkspaceById(workspaceId: string): Promise<Workspace> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .maybeSingle();

  if (error) {
    console.error("getWorkspaceById failed", error.message);
    throw new CoreError("WORKSPACE_LOAD_FAILED", "Failed to load workspace.");
  }
  if (!data) {
    throw new CoreError("WORKSPACE_NOT_FOUND", "Workspace not found.");
  }
  return mapWorkspaceRow(data as Record<string, unknown>);
}

export async function getWorkspaceBySlug(slug: string): Promise<Workspace> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("workspaces")
    .select("*")
    .eq("slug", requireSlug(slug))
    .maybeSingle();

  if (error) {
    console.error("getWorkspaceBySlug failed", error.message);
    throw new CoreError("WORKSPACE_LOAD_FAILED", "Failed to load workspace.");
  }
  if (!data) {
    throw new CoreError("WORKSPACE_NOT_FOUND", "Workspace not found.");
  }
  return mapWorkspaceRow(data as Record<string, unknown>);
}

/**
 * Update basic workspace settings. Slug and custom_domain are immutable here.
 */
export async function updateWorkspaceSettings(
  input: UpdateWorkspaceSettingsInput,
): Promise<Workspace> {
  const values = updateWorkspaceSettingsSchema.parse(input);
  const workspace = await getWorkspaceById(values.workspaceId);
  assertEditable(workspace);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("workspaces")
    .update({
      name: values.name.trim(),
      timezone: values.timezone.trim(),
      locale: values.locale.trim(),
      currency: values.currency.toUpperCase(),
      country: values.country ? values.country.toUpperCase() : null,
      logo_url: values.logoUrl?.trim() || null,
    })
    .eq("id", values.workspaceId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("updateWorkspaceSettings failed", error?.message);
    throw new CoreError(
      "WORKSPACE_UPDATE_FAILED",
      "Failed to update workspace settings.",
    );
  }

  return mapWorkspaceRow(data as Record<string, unknown>);
}

/** Soft-archive. Permanent delete is not supported. */
export async function archiveWorkspace(workspaceId: string): Promise<Workspace> {
  const { workspaceId: id } = workspaceIdSchema.parse({ workspaceId });
  const workspace = await getWorkspaceById(id);

  if (workspace.status === "archived") {
    return workspace;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("workspaces")
    .update({ status: "archived" satisfies WorkspaceStatus })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    console.error("archiveWorkspace failed", error?.message);
    throw new CoreError(
      "WORKSPACE_ARCHIVE_FAILED",
      "Failed to archive workspace.",
    );
  }

  return mapWorkspaceRow(data as Record<string, unknown>);
}

/** Restore an archived workspace to active. */
export async function restoreWorkspace(workspaceId: string): Promise<Workspace> {
  const { workspaceId: id } = workspaceIdSchema.parse({ workspaceId });
  const workspace = await getWorkspaceById(id);

  if (workspace.status !== "archived") {
    throw new CoreError(
      "WORKSPACE_NOT_ARCHIVED",
      "Only archived workspaces can be restored.",
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("workspaces")
    .update({ status: "active" satisfies WorkspaceStatus })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    console.error("restoreWorkspace failed", error?.message);
    throw new CoreError(
      "WORKSPACE_RESTORE_FAILED",
      "Failed to restore workspace.",
    );
  }

  return mapWorkspaceRow(data as Record<string, unknown>);
}

export async function suspendWorkspace(workspaceId: string): Promise<Workspace> {
  const { workspaceId: id } = workspaceIdSchema.parse({ workspaceId });
  const workspace = await getWorkspaceById(id);

  if (workspace.status === "archived") {
    throw new CoreError(
      "WORKSPACE_NOT_EDITABLE",
      "Archived workspaces cannot be suspended. Restore first.",
    );
  }
  if (workspace.status === "suspended") {
    return workspace;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("workspaces")
    .update({ status: "suspended" satisfies WorkspaceStatus })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    console.error("suspendWorkspace failed", error?.message);
    throw new CoreError(
      "WORKSPACE_SUSPEND_FAILED",
      "Failed to suspend workspace.",
    );
  }

  return mapWorkspaceRow(data as Record<string, unknown>);
}

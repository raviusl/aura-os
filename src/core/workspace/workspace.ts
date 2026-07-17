import "server-only";

import { CoreError } from "@/core/errors";
import { requireSlug } from "@/core/lib/slug";
import {
  createWorkspaceSchema,
  type CreateWorkspaceInput,
} from "@/core/schemas";
import type { Workspace, WorkspaceStatus } from "@/core/types";
import { createAdminClient } from "@/lib/supabase/admin";

export type { CreateWorkspaceInput };

export async function createWorkspace(
  input: CreateWorkspaceInput,
): Promise<Workspace> {
  const values = createWorkspaceSchema.parse(input);
  const admin = createAdminClient();
  const slug = requireSlug(values.slug ?? values.name, "workspace slug");

  const { data, error } = await admin
    .from("workspaces")
    .insert({
      name: values.name.trim(),
      slug,
      status: "active" satisfies WorkspaceStatus,
      timezone: values.timezone ?? "UTC",
      locale: values.locale ?? "en",
      currency: (values.currency ?? "USD").toUpperCase(),
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

  return data as Workspace;
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
  return data as Workspace;
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
  return data as Workspace;
}

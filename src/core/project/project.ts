import "server-only";

import { getCompanyById } from "@/core/company/company";
import { CoreError } from "@/core/errors";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/core/schemas";
import {
  type Project,
  type ProjectStatus,
  type ProjectType,
} from "@/core/types";
import { getWorkspaceById } from "@/core/workspace/workspace";
import { createAdminClient } from "@/lib/supabase/admin";

export type { CreateProjectInput };

/**
 * Project skeleton only — no wedding/corporate business logic.
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
  const values = createProjectSchema.parse(input);
  await getWorkspaceById(values.workspaceId);
  const company = await getCompanyById(values.companyId, values.workspaceId);

  if (company.workspace_id !== values.workspaceId) {
    throw new CoreError(
      "COMPANY_WORKSPACE_MISMATCH",
      "Company does not belong to this workspace.",
    );
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .insert({
      workspace_id: values.workspaceId,
      company_id: values.companyId,
      name: values.name.trim(),
      project_type: (values.projectType ?? null) as ProjectType | null,
      status: (values.status ?? "draft") satisfies ProjectStatus,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("createProject failed", error?.message);
    throw new CoreError("PROJECT_CREATE_FAILED", "Failed to create project.");
  }

  return data as Project;
}

export async function getProjectById(
  projectId: string,
  workspaceId?: string,
): Promise<Project> {
  const admin = createAdminClient();
  let query = admin.from("projects").select("*").eq("id", projectId);
  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("getProjectById failed", error.message);
    throw new CoreError("PROJECT_LOAD_FAILED", "Failed to load project.");
  }
  if (!data) {
    throw new CoreError("PROJECT_NOT_FOUND", "Project not found.");
  }
  return data as Project;
}

export async function listProjectsByWorkspace(
  workspaceId: string,
): Promise<Project[]> {
  await getWorkspaceById(workspaceId);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listProjectsByWorkspace failed", error.message);
    throw new CoreError("PROJECT_LIST_FAILED", "Failed to list projects.");
  }

  return (data ?? []) as Project[];
}

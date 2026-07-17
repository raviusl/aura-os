import "server-only";

import type { Project, ProjectStatus, ProjectType } from "@/core/types";
import { createAdminClient } from "@/lib/supabase/admin";

export function mapProjectRow(data: Record<string, unknown>): Project {
  return {
    id: data.id as string,
    workspace_id: data.workspace_id as string,
    company_id: data.company_id as string,
    name: data.name as string,
    project_type: (data.project_type as ProjectType | null | undefined) ?? null,
    status: data.status as ProjectStatus,
    owner_id: (data.owner_id as string | null | undefined) ?? null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

export type InsertProjectRow = {
  workspace_id: string;
  company_id: string;
  name: string;
  project_type?: ProjectType | null;
  status: ProjectStatus;
  owner_id?: string | null;
};

export type UpdateProjectRow = {
  name?: string;
  project_type?: ProjectType | null;
  status?: ProjectStatus;
  owner_id?: string | null;
};

export async function insertProject(row: InsertProjectRow): Promise<Project> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .insert(row)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("insertProject returned no row");
  }

  return mapProjectRow(data as Record<string, unknown>);
}

export async function findProjectById(
  projectId: string,
  workspaceId?: string,
): Promise<Project | null> {
  const admin = createAdminClient();
  let query = admin.from("projects").select("*").eq("id", projectId);
  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }
  return mapProjectRow(data as Record<string, unknown>);
}

export async function findProjectsByCompany(
  workspaceId: string,
  companyId: string,
): Promise<Project[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapProjectRow(row as Record<string, unknown>),
  );
}

export async function findProjectsByWorkspace(
  workspaceId: string,
): Promise<Project[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    mapProjectRow(row as Record<string, unknown>),
  );
}

export async function updateProjectById(
  projectId: string,
  patch: UpdateProjectRow,
): Promise<Project> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("projects")
    .update(patch)
    .eq("id", projectId)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("updateProjectById returned no row");
  }

  return mapProjectRow(data as Record<string, unknown>);
}

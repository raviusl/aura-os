import "server-only";

import { CoreError } from "@/core/errors";
import { requireSlug } from "@/core/lib/slug";
import {
  createCompanySchema,
  type CreateCompanyInput,
} from "@/core/schemas";
import type { Company, CompanyStatus, CompanyType } from "@/core/types";
import { getWorkspaceById } from "@/core/workspace/workspace";
import { createAdminClient } from "@/lib/supabase/admin";

export type { CreateCompanyInput };

export async function createCompany(
  input: CreateCompanyInput,
): Promise<Company> {
  const values = createCompanySchema.parse(input);
  await getWorkspaceById(values.workspaceId);

  const admin = createAdminClient();
  const slug = requireSlug(values.slug ?? values.name, "company slug");

  const { data, error } = await admin
    .from("companies")
    .insert({
      workspace_id: values.workspaceId,
      name: values.name.trim(),
      slug,
      status: "active" satisfies CompanyStatus,
      type: values.type ?? null,
      logo_url: values.logoUrl?.trim() || null,
      country: values.country?.toUpperCase() ?? null,
      timezone: values.timezone ?? null,
      locale: values.locale ?? null,
      currency: values.currency?.toUpperCase() ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      throw new CoreError(
        "COMPANY_SLUG_TAKEN",
        "A company with this slug already exists in the workspace.",
      );
    }
    console.error("createCompany failed", error?.message);
    throw new CoreError("COMPANY_CREATE_FAILED", "Failed to create company.");
  }

  return {
    id: data.id,
    workspace_id: data.workspace_id,
    name: data.name,
    slug: data.slug,
    status: data.status as CompanyStatus,
    type: (data as { type?: CompanyType | null }).type ?? null,
    logo_url: (data as { logo_url?: string | null }).logo_url ?? null,
    country: data.country,
    timezone: data.timezone,
    locale: data.locale,
    currency: data.currency,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

function mapCompanyRow(data: Record<string, unknown>): Company {
  return {
    id: data.id as string,
    workspace_id: data.workspace_id as string,
    name: data.name as string,
    slug: data.slug as string,
    status: data.status as CompanyStatus,
    type: (data.type as CompanyType | null | undefined) ?? null,
    logo_url: (data.logo_url as string | null | undefined) ?? null,
    country: (data.country as string | null | undefined) ?? null,
    timezone: (data.timezone as string | null | undefined) ?? null,
    locale: (data.locale as string | null | undefined) ?? null,
    currency: (data.currency as string | null | undefined) ?? null,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

export async function listCompaniesByWorkspace(
  workspaceId: string,
): Promise<Company[]> {
  await getWorkspaceById(workspaceId);
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("companies")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("listCompaniesByWorkspace failed", error.message);
    throw new CoreError("COMPANY_LIST_FAILED", "Failed to list companies.");
  }

  return (data ?? []).map((row) =>
    mapCompanyRow(row as Record<string, unknown>),
  );
}

export async function getCompanyById(
  companyId: string,
  workspaceId?: string,
): Promise<Company> {
  const admin = createAdminClient();
  let query = admin.from("companies").select("*").eq("id", companyId);
  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("getCompanyById failed", error.message);
    throw new CoreError("COMPANY_LOAD_FAILED", "Failed to load company.");
  }
  if (!data) {
    throw new CoreError("COMPANY_NOT_FOUND", "Company not found.");
  }
  return mapCompanyRow(data as Record<string, unknown>);
}

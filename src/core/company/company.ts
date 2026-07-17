import "server-only";

import { CoreError } from "@/core/errors";
import { requireSlug } from "@/core/lib/slug";
import {
  createCompanySchema,
  type CreateCompanyInput,
} from "@/core/schemas";
import type { Company, CompanyStatus } from "@/core/types";
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

  return data as Company;
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

  return (data ?? []) as Company[];
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
  return data as Company;
}

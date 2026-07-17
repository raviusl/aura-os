import "server-only";

import { getCompanyById } from "@/core/company/company";
import { CoreError } from "@/core/errors";
import { getProjectById } from "@/core/project/project";
import {
  createVendorSchema,
  updateVendorSchema,
  vendorIdSchema,
  type CreateVendorInput,
  type UpdateVendorInput,
  type VendorIdInput,
} from "@/core/schemas";
import type { Vendor, VendorStatus } from "@/core/types";
import { getWorkspaceById } from "@/core/workspace/workspace";
import {
  findVendorById,
  findVendorsByCompany,
  findVendorsByProject,
  insertVendor,
  updateVendorById,
} from "@/core/vendor/repository";

export type { CreateVendorInput, UpdateVendorInput, VendorIdInput };

const EDITABLE_STATUSES: VendorStatus[] = ["active", "inactive"];

function assertEditable(vendor: Vendor): void {
  if (!EDITABLE_STATUSES.includes(vendor.status)) {
    throw new CoreError(
      "VENDOR_NOT_EDITABLE",
      "Archived vendors cannot be edited. Restore the vendor first.",
    );
  }
}

async function assertCompanyInWorkspace(
  workspaceId: string,
  companyId: string,
): Promise<void> {
  const company = await getCompanyById(companyId, workspaceId);
  if (company.workspace_id !== workspaceId) {
    throw new CoreError(
      "COMPANY_WORKSPACE_MISMATCH",
      "Company does not belong to this workspace.",
    );
  }
}

async function assertProjectInCompany(
  workspaceId: string,
  companyId: string,
  projectId: string,
): Promise<void> {
  const project = await getProjectById(projectId, workspaceId);
  if (project.company_id !== companyId || project.workspace_id !== workspaceId) {
    throw new CoreError(
      "PROJECT_SCOPE_MISMATCH",
      "Project does not belong to this company.",
    );
  }
}

export async function createVendor(input: CreateVendorInput): Promise<Vendor> {
  const values = createVendorSchema.parse(input);
  await getWorkspaceById(values.workspaceId);
  await assertCompanyInWorkspace(values.workspaceId, values.companyId);

  if (values.projectId) {
    await assertProjectInCompany(
      values.workspaceId,
      values.companyId,
      values.projectId,
    );
  }

  try {
    return await insertVendor({
      workspace_id: values.workspaceId,
      company_id: values.companyId,
      project_id: values.projectId ?? null,
      name: values.name.trim(),
      email: values.email?.trim().toLowerCase() || null,
      phone: values.phone?.trim() || null,
      category: values.category ?? null,
      status: values.status ?? "active",
      notes: values.notes?.trim() || null,
    });
  } catch (error) {
    console.error("createVendor failed", error);
    throw new CoreError("VENDOR_CREATE_FAILED", "Failed to create vendor.");
  }
}

export async function getVendorById(
  vendorId: string,
  workspaceId?: string,
): Promise<Vendor> {
  try {
    const vendor = await findVendorById(vendorId, workspaceId);
    if (!vendor) {
      throw new CoreError("VENDOR_NOT_FOUND", "Vendor not found.");
    }
    return vendor;
  } catch (error) {
    if (error instanceof CoreError) {
      throw error;
    }
    console.error("getVendorById failed", error);
    throw new CoreError("VENDOR_LOAD_FAILED", "Failed to load vendor.");
  }
}

export async function listVendorsByCompany(
  workspaceId: string,
  companyId: string,
): Promise<Vendor[]> {
  await getWorkspaceById(workspaceId);
  await assertCompanyInWorkspace(workspaceId, companyId);

  try {
    return await findVendorsByCompany(workspaceId, companyId);
  } catch (error) {
    console.error("listVendorsByCompany failed", error);
    throw new CoreError("VENDOR_LIST_FAILED", "Failed to list vendors.");
  }
}

export async function listVendorsByProject(
  workspaceId: string,
  companyId: string,
  projectId: string,
): Promise<Vendor[]> {
  await getWorkspaceById(workspaceId);
  await assertCompanyInWorkspace(workspaceId, companyId);
  await assertProjectInCompany(workspaceId, companyId, projectId);

  try {
    return await findVendorsByProject(workspaceId, companyId, projectId);
  } catch (error) {
    console.error("listVendorsByProject failed", error);
    throw new CoreError("VENDOR_LIST_FAILED", "Failed to list vendors.");
  }
}

export async function updateVendor(input: UpdateVendorInput): Promise<Vendor> {
  const values = updateVendorSchema.parse(input);
  const vendor = await getVendorById(values.vendorId, values.workspaceId);

  if (
    vendor.company_id !== values.companyId ||
    vendor.workspace_id !== values.workspaceId
  ) {
    throw new CoreError(
      "VENDOR_SCOPE_MISMATCH",
      "Vendor does not belong to this company.",
    );
  }

  assertEditable(vendor);

  if (values.projectId) {
    await assertProjectInCompany(
      values.workspaceId,
      values.companyId,
      values.projectId,
    );
  }

  try {
    return await updateVendorById(vendor.id, {
      name: values.name.trim(),
      email: values.email?.trim().toLowerCase() || null,
      phone: values.phone?.trim() || null,
      category: values.category ?? null,
      project_id:
        values.projectId !== undefined ? values.projectId : vendor.project_id,
      status: values.status ?? vendor.status,
      notes:
        values.notes !== undefined
          ? values.notes?.trim() || null
          : vendor.notes,
    });
  } catch (error) {
    console.error("updateVendor failed", error);
    throw new CoreError("VENDOR_UPDATE_FAILED", "Failed to update vendor.");
  }
}

export async function archiveVendor(input: VendorIdInput): Promise<Vendor> {
  const values = vendorIdSchema.parse(input);
  const vendor = await getVendorById(values.vendorId, values.workspaceId);

  if (vendor.company_id !== values.companyId) {
    throw new CoreError(
      "VENDOR_SCOPE_MISMATCH",
      "Vendor does not belong to this company.",
    );
  }
  if (vendor.status === "archived") {
    return vendor;
  }

  try {
    return await updateVendorById(vendor.id, { status: "archived" });
  } catch (error) {
    console.error("archiveVendor failed", error);
    throw new CoreError("VENDOR_ARCHIVE_FAILED", "Failed to archive vendor.");
  }
}

export async function restoreVendor(input: VendorIdInput): Promise<Vendor> {
  const values = vendorIdSchema.parse(input);
  const vendor = await getVendorById(values.vendorId, values.workspaceId);

  if (vendor.company_id !== values.companyId) {
    throw new CoreError(
      "VENDOR_SCOPE_MISMATCH",
      "Vendor does not belong to this company.",
    );
  }
  if (vendor.status !== "archived") {
    throw new CoreError(
      "VENDOR_NOT_ARCHIVED",
      "Only archived vendors can be restored.",
    );
  }

  try {
    return await updateVendorById(vendor.id, { status: "active" });
  } catch (error) {
    console.error("restoreVendor failed", error);
    throw new CoreError("VENDOR_RESTORE_FAILED", "Failed to restore vendor.");
  }
}

export async function deactivateVendor(input: VendorIdInput): Promise<Vendor> {
  const values = vendorIdSchema.parse(input);
  const vendor = await getVendorById(values.vendorId, values.workspaceId);

  if (vendor.company_id !== values.companyId) {
    throw new CoreError(
      "VENDOR_SCOPE_MISMATCH",
      "Vendor does not belong to this company.",
    );
  }
  if (vendor.status === "archived") {
    throw new CoreError(
      "VENDOR_NOT_EDITABLE",
      "Archived vendors cannot be deactivated. Restore first.",
    );
  }
  if (vendor.status === "inactive") {
    return vendor;
  }

  try {
    return await updateVendorById(vendor.id, { status: "inactive" });
  } catch (error) {
    console.error("deactivateVendor failed", error);
    throw new CoreError(
      "VENDOR_DEACTIVATE_FAILED",
      "Failed to deactivate vendor.",
    );
  }
}

import "server-only";

import { getCompanyById } from "@/core/company/company";
import { CoreError } from "@/core/errors";
import { getProjectById } from "@/core/project/project";
import {
  clientIdSchema,
  createClientSchema,
  updateClientSchema,
  type ClientIdInput,
  type CreateClientInput,
  type UpdateClientInput,
} from "@/core/schemas";
import type { Client, ClientStatus } from "@/core/types";
import { getWorkspaceById } from "@/core/workspace/workspace";
import {
  findClientById,
  findClientsByCompany,
  findClientsByProject,
  insertClient,
  updateClientById,
} from "@/core/client/repository";

export type { CreateClientInput, UpdateClientInput, ClientIdInput };

const EDITABLE_STATUSES: ClientStatus[] = ["active", "follow_up"];

function assertEditable(client: Client): void {
  if (!EDITABLE_STATUSES.includes(client.status)) {
    throw new CoreError(
      "CLIENT_NOT_EDITABLE",
      "Archived clients cannot be edited. Restore the client first.",
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

export async function createClient(input: CreateClientInput): Promise<Client> {
  const values = createClientSchema.parse(input);
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
    return await insertClient({
      workspace_id: values.workspaceId,
      company_id: values.companyId,
      project_id: values.projectId ?? null,
      name: values.name.trim(),
      email: values.email?.trim().toLowerCase() || null,
      phone: values.phone?.trim() || null,
      client_type: values.clientType ?? null,
      status: values.status ?? "active",
      follow_up_at: values.followUpAt ?? null,
      notes: values.notes?.trim() || null,
    });
  } catch (error) {
    console.error("createClient failed", error);
    throw new CoreError("CLIENT_CREATE_FAILED", "Failed to create client.");
  }
}

export async function getClientById(
  clientId: string,
  workspaceId?: string,
): Promise<Client> {
  try {
    const client = await findClientById(clientId, workspaceId);
    if (!client) {
      throw new CoreError("CLIENT_NOT_FOUND", "Client not found.");
    }
    return client;
  } catch (error) {
    if (error instanceof CoreError) {
      throw error;
    }
    console.error("getClientById failed", error);
    throw new CoreError("CLIENT_LOAD_FAILED", "Failed to load client.");
  }
}

export async function listClientsByCompany(
  workspaceId: string,
  companyId: string,
): Promise<Client[]> {
  await getWorkspaceById(workspaceId);
  await assertCompanyInWorkspace(workspaceId, companyId);

  try {
    return await findClientsByCompany(workspaceId, companyId);
  } catch (error) {
    console.error("listClientsByCompany failed", error);
    throw new CoreError("CLIENT_LIST_FAILED", "Failed to list clients.");
  }
}

export async function listClientsByProject(
  workspaceId: string,
  companyId: string,
  projectId: string,
): Promise<Client[]> {
  await getWorkspaceById(workspaceId);
  await assertCompanyInWorkspace(workspaceId, companyId);
  await assertProjectInCompany(workspaceId, companyId, projectId);

  try {
    return await findClientsByProject(workspaceId, companyId, projectId);
  } catch (error) {
    console.error("listClientsByProject failed", error);
    throw new CoreError("CLIENT_LIST_FAILED", "Failed to list clients.");
  }
}

export async function updateClient(input: UpdateClientInput): Promise<Client> {
  const values = updateClientSchema.parse(input);
  const client = await getClientById(values.clientId, values.workspaceId);

  if (
    client.company_id !== values.companyId ||
    client.workspace_id !== values.workspaceId
  ) {
    throw new CoreError(
      "CLIENT_SCOPE_MISMATCH",
      "Client does not belong to this company.",
    );
  }

  assertEditable(client);

  if (values.projectId) {
    await assertProjectInCompany(
      values.workspaceId,
      values.companyId,
      values.projectId,
    );
  }

  try {
    return await updateClientById(client.id, {
      name: values.name.trim(),
      email: values.email?.trim().toLowerCase() || null,
      phone: values.phone?.trim() || null,
      client_type: values.clientType ?? null,
      project_id: values.projectId !== undefined ? values.projectId : client.project_id,
      status: values.status ?? client.status,
      follow_up_at:
        values.followUpAt !== undefined ? values.followUpAt : client.follow_up_at,
      notes: values.notes !== undefined ? values.notes?.trim() || null : client.notes,
    });
  } catch (error) {
    console.error("updateClient failed", error);
    throw new CoreError("CLIENT_UPDATE_FAILED", "Failed to update client.");
  }
}

export async function archiveClient(input: ClientIdInput): Promise<Client> {
  const values = clientIdSchema.parse(input);
  const client = await getClientById(values.clientId, values.workspaceId);

  if (client.company_id !== values.companyId) {
    throw new CoreError(
      "CLIENT_SCOPE_MISMATCH",
      "Client does not belong to this company.",
    );
  }
  if (client.status === "archived") {
    return client;
  }

  try {
    return await updateClientById(client.id, { status: "archived" });
  } catch (error) {
    console.error("archiveClient failed", error);
    throw new CoreError("CLIENT_ARCHIVE_FAILED", "Failed to archive client.");
  }
}

export async function restoreClient(input: ClientIdInput): Promise<Client> {
  const values = clientIdSchema.parse(input);
  const client = await getClientById(values.clientId, values.workspaceId);

  if (client.company_id !== values.companyId) {
    throw new CoreError(
      "CLIENT_SCOPE_MISMATCH",
      "Client does not belong to this company.",
    );
  }
  if (client.status !== "archived") {
    throw new CoreError(
      "CLIENT_NOT_ARCHIVED",
      "Only archived clients can be restored.",
    );
  }

  try {
    return await updateClientById(client.id, { status: "active" });
  } catch (error) {
    console.error("restoreClient failed", error);
    throw new CoreError("CLIENT_RESTORE_FAILED", "Failed to restore client.");
  }
}

export async function markClientFollowUp(
  input: ClientIdInput,
): Promise<Client> {
  const values = clientIdSchema.parse(input);
  const client = await getClientById(values.clientId, values.workspaceId);

  if (client.company_id !== values.companyId) {
    throw new CoreError(
      "CLIENT_SCOPE_MISMATCH",
      "Client does not belong to this company.",
    );
  }
  if (client.status === "archived") {
    throw new CoreError(
      "CLIENT_NOT_EDITABLE",
      "Archived clients cannot be marked for follow-up. Restore first.",
    );
  }

  try {
    return await updateClientById(client.id, { status: "follow_up" });
  } catch (error) {
    console.error("markClientFollowUp failed", error);
    throw new CoreError(
      "CLIENT_FOLLOW_UP_FAILED",
      "Failed to mark client for follow-up.",
    );
  }
}

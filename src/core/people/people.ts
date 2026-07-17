import "server-only";

import { getCompanyById } from "@/core/company/company";
import { CoreError } from "@/core/errors";
import { assertPersonPermission } from "@/core/permissions/rbac";
import {
  createPersonSchema,
  type CreatePersonInput,
} from "@/core/schemas";
import type { CoreRole, Person, PersonRole } from "@/core/types";
import { getWorkspaceById } from "@/core/workspace/workspace";
import { createAdminClient } from "@/lib/supabase/admin";

export type { CreatePersonInput };

export async function createPerson(
  input: CreatePersonInput,
): Promise<{ person: Person; roles: PersonRole[] }> {
  const values = createPersonSchema.parse(input);
  await getWorkspaceById(values.workspaceId);

  if (values.companyId) {
    const company = await getCompanyById(values.companyId, values.workspaceId);
    if (company.workspace_id !== values.workspaceId) {
      throw new CoreError(
        "COMPANY_WORKSPACE_MISMATCH",
        "Company does not belong to this workspace.",
      );
    }
  }

  const admin = createAdminClient();
  const email = values.email.trim().toLowerCase();

  const { data: person, error } = await admin
    .from("people")
    .insert({
      workspace_id: values.workspaceId,
      company_id: values.companyId ?? null,
      user_id: values.userId ?? null,
      email,
      full_name: values.fullName.trim(),
      status: values.status ?? (values.userId ? "active" : "invited"),
    })
    .select("*")
    .single();

  if (error || !person) {
    if (error?.code === "23505") {
      throw new CoreError(
        "PERSON_EXISTS",
        "A person with this email already exists in the workspace.",
      );
    }
    console.error("createPerson failed", error?.message);
    throw new CoreError("PERSON_CREATE_FAILED", "Failed to create person.");
  }

  const roles = await assignRole(person.id, values.role);
  return { person: person as Person, roles };
}

export async function assignRole(
  personId: string,
  roleKey: CoreRole | string,
): Promise<PersonRole[]> {
  const admin = createAdminClient();

  const { error: insertError } = await admin.from("person_roles").upsert(
    {
      person_id: personId,
      role_key: roleKey,
    },
    { onConflict: "person_id,role_key", ignoreDuplicates: true },
  );

  if (insertError) {
    console.error("assignRole failed", insertError.message);
    throw new CoreError("ROLE_ASSIGN_FAILED", "Failed to assign role.");
  }

  const { data, error } = await admin
    .from("person_roles")
    .select("*")
    .eq("person_id", personId);

  if (error) {
    console.error("assignRole list failed", error.message);
    throw new CoreError("ROLE_LIST_FAILED", "Failed to load person roles.");
  }

  return (data ?? []) as PersonRole[];
}

export async function getPersonByUserAndWorkspace(
  userId: string,
  workspaceId: string,
): Promise<Person | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("people")
    .select("*")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) {
    console.error("getPersonByUserAndWorkspace failed", error.message);
    throw new CoreError("PERSON_LOAD_FAILED", "Failed to load person.");
  }

  return (data as Person | null) ?? null;
}

export async function getPersonById(personId: string): Promise<Person> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("people")
    .select("*")
    .eq("id", personId)
    .maybeSingle();

  if (error) {
    console.error("getPersonById failed", error.message);
    throw new CoreError("PERSON_LOAD_FAILED", "Failed to load person.");
  }
  if (!data) {
    throw new CoreError("PERSON_NOT_FOUND", "Person not found.");
  }
  return data as Person;
}

export async function listPeopleByWorkspace(
  workspaceId: string,
): Promise<Person[]> {
  await getWorkspaceById(workspaceId);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("people")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("listPeopleByWorkspace failed", error.message);
    throw new CoreError("PERSON_LIST_FAILED", "Failed to list people.");
  }

  return (data ?? []) as Person[];
}

export async function requirePersonPermission(
  userId: string,
  workspaceId: string,
  permission: string,
): Promise<Person> {
  const person = await getPersonByUserAndWorkspace(userId, workspaceId);
  if (!person || person.status !== "active") {
    throw new CoreError(
      "PERMISSION_DENIED",
      "You do not have access to this workspace.",
    );
  }
  await assertPersonPermission(person.id, permission);
  return person;
}

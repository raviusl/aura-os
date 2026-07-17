"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { resolveContextStep } from "@/core/auth/context";
import { requireSessionUserId } from "@/core/auth/session";
import { switchActiveCompany } from "@/core/company/active-company";
import { toCoreUserMessage } from "@/core/errors";
import type { SwitchCompanyInput } from "@/core/schemas";
import { switchActiveWorkspace } from "@/core/workspace/active-workspace";
import { setActiveCompanyIdCookie } from "@/core/company/active-company";

export type ContextActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateContextPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/select-workspace");
  revalidatePath("/dashboard/select-company");
}

/** Post-login entry: User → Workspace → Company → Dashboard */
export async function enterDashboardAction(): Promise<void> {
  const userId = await requireSessionUserId();
  const step = await resolveContextStep(userId);

  if (step.step === "workspace") {
    redirect(
      step.workspaces.length === 0
        ? "/dashboard/workspaces/new"
        : "/dashboard/select-workspace",
    );
  }
  if (step.step === "company") {
    redirect("/dashboard/select-company");
  }

  redirect("/dashboard");
}

export async function switchCompanyAction(
  input: SwitchCompanyInput,
): Promise<ContextActionResult<{ companyId: string }>> {
  try {
    const userId = await requireSessionUserId();
    const result = await switchActiveCompany(
      userId,
      input.workspaceId,
      input.companyId,
    );
    revalidateContextPaths();
    return { ok: true, data: { companyId: result.company.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to switch company"),
    };
  }
}

export async function selectWorkspaceAndContinueAction(input: {
  workspaceId: string;
}): Promise<ContextActionResult> {
  try {
    const userId = await requireSessionUserId();
    await switchActiveWorkspace(userId, input.workspaceId);
    revalidateContextPaths();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to select workspace"),
    };
  }
}

export async function selectCompanyAndContinueAction(input: {
  workspaceId: string;
  companyId: string;
}): Promise<ContextActionResult> {
  try {
    const userId = await requireSessionUserId();
    await switchActiveCompany(userId, input.workspaceId, input.companyId);
    await setActiveCompanyIdCookie(input.companyId);
    revalidateContextPaths();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to select company"),
    };
  }
}

import type { Project } from "@/core/types";

export type ProjectContextValue = {
  workspaceId: string | null;
  companyId: string | null;
  projects: Project[];
};

export function toProjectContextValue(input: {
  workspaceId: string | null;
  companyId: string | null;
  projects: Project[];
}): ProjectContextValue {
  return {
    workspaceId: input.workspaceId,
    companyId: input.companyId,
    projects: input.projects,
  };
}

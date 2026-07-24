export const PROJECT_WORKSPACE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "clients", label: "Clients" },
  { id: "vendors", label: "Vendors" },
  { id: "timeline", label: "Timeline" },
  { id: "documents", label: "Documents" },
  { id: "finance", label: "Finance" },
  { id: "tasks", label: "Tasks" },
  { id: "activity", label: "Activity" },
] as const;

export type ProjectWorkspaceTabId =
  (typeof PROJECT_WORKSPACE_TABS)[number]["id"];

export const DEFAULT_PROJECT_WORKSPACE_TAB: ProjectWorkspaceTabId = "overview";

export const PROJECT_WORKSPACE_PLACEHOLDER_TABS = [
  "timeline",
  "documents",
  "finance",
  "tasks",
  "activity",
] as const satisfies readonly ProjectWorkspaceTabId[];

export function isProjectWorkspaceTabId(
  value: string | null | undefined,
): value is ProjectWorkspaceTabId {
  return PROJECT_WORKSPACE_TABS.some((tab) => tab.id === value);
}

export function parseProjectWorkspaceTab(
  value: string | null | undefined,
): ProjectWorkspaceTabId {
  return isProjectWorkspaceTabId(value)
    ? value
    : DEFAULT_PROJECT_WORKSPACE_TAB;
}

/** Build a project workspace URL for a tab (history / deep-link safe). */
export function buildProjectWorkspaceHref(
  projectId: string,
  tab: ProjectWorkspaceTabId = DEFAULT_PROJECT_WORKSPACE_TAB,
): string {
  const base = `/dashboard/projects/${projectId}`;
  if (tab === DEFAULT_PROJECT_WORKSPACE_TAB) {
    return base;
  }
  return `${base}?tab=${tab}`;
}

/** Explicit tab URLs including ?tab=overview when requested. */
export function buildProjectWorkspaceTabHref(
  projectId: string,
  tab: ProjectWorkspaceTabId,
  options?: { explicitOverview?: boolean },
): string {
  const base = `/dashboard/projects/${projectId}`;
  if (tab === DEFAULT_PROJECT_WORKSPACE_TAB && !options?.explicitOverview) {
    return base;
  }
  return `${base}?tab=${tab}`;
}

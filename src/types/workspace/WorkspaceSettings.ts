import type { WorkspaceId } from "./Workspace";

/**
 * Workspace settings definitions (Sprint 004 foundation).
 * Types only — no settings persistence or UI.
 */
export interface WorkspaceBrandingSettings {
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export interface WorkspaceLocaleSettings {
  locale: string;
}

export interface WorkspaceTimezoneSettings {
  timezone: string;
}

export interface WorkspacePreferences {
  dateFormat?: string;
  timeFormat?: "12h" | "24h";
}

export interface WorkspaceSettings {
  workspaceId: WorkspaceId;
  branding: WorkspaceBrandingSettings;
  locale: WorkspaceLocaleSettings;
  timezone: WorkspaceTimezoneSettings;
  preferences: WorkspacePreferences;
}

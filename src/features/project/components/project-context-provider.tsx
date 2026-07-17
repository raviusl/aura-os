"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { ProjectContextValue } from "@/features/project/lib/project-context";

const ProjectContext = createContext<ProjectContextValue | null>(null);

type ProjectContextProviderProps = {
  value: ProjectContextValue;
  children: ReactNode;
};

export function ProjectContextProvider({
  value,
  children,
}: ProjectContextProviderProps) {
  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProjectContext(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error(
      "useProjectContext must be used within ProjectContextProvider",
    );
  }
  return context;
}

export function useCompanyProjects() {
  const { projects, companyId, workspaceId } = useProjectContext();
  return { projects, companyId, workspaceId };
}

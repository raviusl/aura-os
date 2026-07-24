"use client";

import type { Client, Project, Vendor } from "@/core/types";
import { ProjectWorkspaceClientsPanel } from "@/features/project/components/project-workspace-clients-panel";
import { ProjectWorkspaceVendorsPanel } from "@/features/project/components/project-workspace-vendors-panel";

type ProjectWorkspaceOverviewProps = {
  project: Project;
  clients: Client[];
  vendors: Vendor[];
  canWriteClient: boolean;
  canWriteVendor: boolean;
  canReadClient: boolean;
  canReadVendor: boolean;
};

/** Current Project Workspace body: linked clients + vendors. */
export function ProjectWorkspaceOverview({
  project,
  clients,
  vendors,
  canWriteClient,
  canWriteVendor,
  canReadClient,
  canReadVendor,
}: ProjectWorkspaceOverviewProps) {
  return (
    <div className="space-y-8">
      <ProjectWorkspaceClientsPanel
        project={project}
        clients={clients}
        canWriteClient={canWriteClient}
        canReadClient={canReadClient}
      />

      <ProjectWorkspaceVendorsPanel
        project={project}
        vendors={vendors}
        canWriteVendor={canWriteVendor}
        canReadVendor={canReadVendor}
      />
    </div>
  );
}

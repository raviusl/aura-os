import { z } from "zod";

import { CORE_ROLES, PROJECT_TYPES } from "@/core/types";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(64).optional(),
  timezone: z.string().min(1).max(64).optional(),
  locale: z.string().min(2).max(16).optional(),
  currency: z.string().length(3).optional(),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const createCompanySchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(64).optional(),
  country: z.string().min(2).max(2).optional(),
  timezone: z.string().min(1).max(64).optional(),
  locale: z.string().min(2).max(16).optional(),
  currency: z.string().length(3).optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export const createPersonSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid().nullable().optional(),
  email: z.string().email(),
  fullName: z.string().min(1).max(160),
  role: z.enum(CORE_ROLES),
  userId: z.string().uuid().nullable().optional(),
  status: z.enum(["invited", "active", "disabled", "archived"]).optional(),
});

export type CreatePersonInput = z.infer<typeof createPersonSchema>;

export const createProjectSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  name: z.string().min(1).max(160),
  projectType: z.enum(PROJECT_TYPES).nullable().optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const invitePersonSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid().nullable().optional(),
  email: z.string().email(),
  fullName: z.string().min(1).max(160),
  role: z.enum(CORE_ROLES),
});

export type InvitePersonInput = z.infer<typeof invitePersonSchema>;

export const acceptCoreInvitationSchema = z
  .object({
    token: z.string().min(20),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AcceptCoreInvitationInput = z.infer<
  typeof acceptCoreInvitationSchema
>;

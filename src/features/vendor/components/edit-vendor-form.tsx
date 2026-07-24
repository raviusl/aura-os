"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateVendorAction } from "@/core/actions/vendor-actions";
import { VENDOR_CATEGORIES, type Project, type Vendor } from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";
import { vendorCategoryLabel } from "@/features/vendor/lib/vendor-context";

const formSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  vendorId: z.string().uuid(),
  projectId: z.string().uuid().optional().or(z.literal("")),
  name: z.string().min(1, "Vendor name is required").max(160),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional(),
  category: z.enum(VENDOR_CATEGORIES),
});

type FormValues = z.infer<typeof formSchema>;

type EditVendorFormProps = {
  vendor: Vendor;
  projects: Project[];
};

export function EditVendorForm({ vendor, projects }: EditVendorFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceId: vendor.workspace_id,
      companyId: vendor.company_id,
      vendorId: vendor.id,
      projectId: vendor.project_id ?? "",
      name: vendor.name,
      email: vendor.email ?? "",
      phone: vendor.phone ?? "",
      category: vendor.category ?? "others",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await updateVendorAction({
            workspaceId: values.workspaceId,
            companyId: values.companyId,
            vendorId: values.vendorId,
            projectId: values.projectId || null,
            name: values.name,
            email: values.email || null,
            phone: values.phone || null,
            category: values.category,
            status: vendor.status === "archived" ? "active" : vendor.status,
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Vendor updated");
          router.push(
            values.projectId
              ? `/dashboard/projects/${values.projectId}`
              : "/dashboard/vendors",
          );
          router.refresh();
        });
      })}
    >
      <input type="hidden" {...form.register("workspaceId")} />
      <input type="hidden" {...form.register("companyId")} />
      <input type="hidden" {...form.register("vendorId")} />

      <div className="space-y-2">
        <Label htmlFor="edit-vendor-name">Name</Label>
        <Input
          id="edit-vendor-name"
          className={authFieldClassName}
          disabled={pending}
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="text-xs text-red-400">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-vendor-category">Category</Label>
        <select
          id="edit-vendor-category"
          className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
          disabled={pending}
          {...form.register("category")}
        >
          {VENDOR_CATEGORIES.map((category) => (
            <option key={category} value={category} className="bg-[#121214]">
              {vendorCategoryLabel(category)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-vendor-email">Email</Label>
          <Input
            id="edit-vendor-email"
            type="email"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("email")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-vendor-phone">Phone</Label>
          <Input
            id="edit-vendor-phone"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("phone")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-vendor-project">Project (optional)</Label>
        <select
          id="edit-vendor-project"
          className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
          disabled={pending}
          {...form.register("projectId")}
        >
          <option value="" className="bg-[#121214]">
            No project
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id} className="bg-[#121214]">
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="bg-white text-black hover:bg-white/90"
      >
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

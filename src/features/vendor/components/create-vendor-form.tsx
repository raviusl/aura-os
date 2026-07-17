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
import { createVendorAction } from "@/core/actions/vendor-actions";
import { VENDOR_CATEGORIES, type Project } from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";
import { vendorCategoryLabel } from "@/features/vendor/lib/vendor-context";

const formSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid().optional().or(z.literal("")),
  name: z.string().min(1, "Vendor name is required").max(160),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional(),
  category: z.enum(VENDOR_CATEGORIES),
});

type FormValues = z.infer<typeof formSchema>;

type CreateVendorFormProps = {
  workspaceId: string;
  companyId: string;
  projects: Project[];
};

export function CreateVendorForm({
  workspaceId,
  companyId,
  projects,
}: CreateVendorFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceId,
      companyId,
      projectId: "",
      name: "",
      email: "",
      phone: "",
      category: "others",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await createVendorAction({
            workspaceId: values.workspaceId,
            companyId: values.companyId,
            projectId: values.projectId || null,
            name: values.name,
            email: values.email || null,
            phone: values.phone || null,
            category: values.category,
            status: "active",
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Vendor created");
          router.push("/dashboard/vendors");
          router.refresh();
        });
      })}
    >
      <input type="hidden" {...form.register("workspaceId")} />
      <input type="hidden" {...form.register("companyId")} />

      <div className="space-y-2">
        <Label htmlFor="vendor-name">Name</Label>
        <Input
          id="vendor-name"
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
        <Label htmlFor="vendor-category">Category</Label>
        <select
          id="vendor-category"
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
          <Label htmlFor="vendor-email">Email</Label>
          <Input
            id="vendor-email"
            type="email"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("email")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendor-phone">Phone</Label>
          <Input
            id="vendor-phone"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("phone")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vendor-project">Project (optional)</Label>
        <select
          id="vendor-project"
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
        {pending ? "Creating…" : "Create vendor"}
      </Button>
    </form>
  );
}

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
import { createClientAction } from "@/core/actions/client-actions";
import { CLIENT_TYPES, type Project } from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";

const formSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid().optional().or(z.literal("")),
  name: z.string().min(1, "Client name is required").max(160),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional(),
  clientType: z.enum(CLIENT_TYPES),
});

type FormValues = z.infer<typeof formSchema>;

type CreateClientFormProps = {
  workspaceId: string;
  companyId: string;
  projects: Project[];
};

export function CreateClientForm({
  workspaceId,
  companyId,
  projects,
}: CreateClientFormProps) {
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
      clientType: "individual",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await createClientAction({
            workspaceId: values.workspaceId,
            companyId: values.companyId,
            projectId: values.projectId || null,
            name: values.name,
            email: values.email || null,
            phone: values.phone || null,
            clientType: values.clientType,
            status: "active",
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Client created");
          router.push("/dashboard/clients");
          router.refresh();
        });
      })}
    >
      <input type="hidden" {...form.register("workspaceId")} />
      <input type="hidden" {...form.register("companyId")} />

      <div className="space-y-2">
        <Label htmlFor="client-name">Name</Label>
        <Input
          id="client-name"
          className={authFieldClassName}
          disabled={pending}
          {...form.register("name")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-type">Type</Label>
        <select
          id="client-type"
          className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
          disabled={pending}
          {...form.register("clientType")}
        >
          {CLIENT_TYPES.map((type) => (
            <option key={type} value={type} className="bg-[#121214]">
              {type === "corporate"
                ? "Corporate Client"
                : type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client-email">Email</Label>
          <Input
            id="client-email"
            type="email"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("email")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-phone">Phone</Label>
          <Input
            id="client-phone"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("phone")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-project">Project (optional)</Label>
        <select
          id="client-project"
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
        {pending ? "Creating…" : "Create client"}
      </Button>
    </form>
  );
}

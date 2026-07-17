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
import { createCompanyAction } from "@/core/actions/company-actions";
import { COMPANY_TYPES } from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";

const formSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().min(1, "Company name is required").max(160),
  type: z.enum(COMPANY_TYPES).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CreateCompanyFormProps = {
  workspaceId: string;
};

export function CreateCompanyForm({ workspaceId }: CreateCompanyFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceId,
      name: "",
      type: "agency",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await createCompanyAction({
            workspaceId: values.workspaceId,
            name: values.name,
            type: values.type,
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Company created");
          router.push("/dashboard");
          router.refresh();
        });
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="company-name">Company name</Label>
        <Input
          id="company-name"
          className={authFieldClassName}
          disabled={pending}
          {...form.register("name")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company-type">Type</Label>
        <select
          id="company-type"
          className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
          disabled={pending}
          {...form.register("type")}
        >
          {COMPANY_TYPES.map((type) => (
            <option key={type} value={type} className="bg-[#121214]">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="bg-white text-black hover:bg-white/90"
      >
        {pending ? "Creating…" : "Create company"}
      </Button>
    </form>
  );
}

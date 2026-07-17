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
import { createWorkspaceAction } from "@/core/actions/workspace-actions";
import { slugify } from "@/core/lib/slug";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";

const formSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(120),
  slug: z.string().max(64).optional(),
  timezone: z.string().min(1).max(64),
  locale: z.string().min(2).max(16),
  currency: z.string().length(3),
  country: z.string().max(2).optional(),
  logoUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateWorkspaceForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      timezone: "UTC",
      locale: "en",
      currency: "USD",
      country: "",
      logoUrl: "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const slug = values.slug?.trim();
          const country = values.country?.trim().toUpperCase();
          const logoUrl = values.logoUrl?.trim();

          const result = await createWorkspaceAction({
            name: values.name,
            slug: slug || undefined,
            timezone: values.timezone,
            locale: values.locale,
            currency: values.currency.toUpperCase(),
            country: country || null,
            logoUrl: logoUrl || null,
            status: "active",
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Workspace created");
          router.push("/dashboard/settings/workspace");
          router.refresh();
        });
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="workspace-name">Name</Label>
        <Input
          id="workspace-name"
          className={authFieldClassName}
          placeholder="Acme Events"
          disabled={pending}
          {...form.register("name", {
            onChange: (event) => {
              const name = event.target.value as string;
              if (!form.getValues("slug")) {
                form.setValue("slug", slugify(name), { shouldValidate: false });
              }
            },
          })}
        />
        {form.formState.errors.name ? (
          <p className="text-xs text-red-400">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="workspace-slug">Slug</Label>
        <Input
          id="workspace-slug"
          className={authFieldClassName}
          placeholder="acme-events"
          disabled={pending}
          {...form.register("slug")}
        />
        <p className="text-xs text-white/35">
          Unique URL identifier. Must be unique across all workspaces.
        </p>
        {form.formState.errors.slug ? (
          <p className="text-xs text-red-400">
            {form.formState.errors.slug.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="workspace-timezone">Timezone</Label>
          <Input
            id="workspace-timezone"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("timezone")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workspace-locale">Locale</Label>
          <Input
            id="workspace-locale"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("locale")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workspace-currency">Currency</Label>
          <Input
            id="workspace-currency"
            className={authFieldClassName}
            maxLength={3}
            disabled={pending}
            {...form.register("currency")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workspace-country">Country (ISO)</Label>
          <Input
            id="workspace-country"
            className={authFieldClassName}
            maxLength={2}
            placeholder="US"
            disabled={pending}
            {...form.register("country")}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="bg-white text-black hover:bg-white/90"
      >
        {pending ? "Creating…" : "Create workspace"}
      </Button>
    </form>
  );
}

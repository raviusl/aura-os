import { CoreError } from "@/core/errors";

/**
 * Slug helpers for Workspace / Company identifiers.
 */

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function requireSlug(value: string, label = "slug"): string {
  const slug = slugify(value);
  if (!slug) {
    throw new CoreError("INVALID_SLUG", `${label} is required`);
  }
  return slug;
}

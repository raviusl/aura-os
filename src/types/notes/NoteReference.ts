import type { NoteId } from "./Note";

export type NoteReferenceId = string;

/**
 * Domains a Note may attach to.
 * Vendor and Meeting IDs remain opaque until those foundations exist.
 */
export const NOTE_REFERENCE_TARGET_TYPES = [
  "workspace",
  "company",
  "project",
  "client",
  "vendor",
  "task",
  "timeline",
  "meeting",
] as const;

export type NoteReferenceTargetType =
  (typeof NOTE_REFERENCE_TARGET_TYPES)[number];

/**
 * Polymorphic attachment of one Note to one target entity.
 * One Note may have multiple references.
 */
export interface NoteReference {
  id: NoteReferenceId;
  noteId: NoteId;
  targetType: NoteReferenceTargetType;
  targetId: string;
}

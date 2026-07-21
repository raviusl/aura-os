import type { PersonId } from "@/types/people";

export type NoteId = string;

/**
 * Universal note identity for RIVA communication (Project 016 foundation).
 * Content is opaque text; rich editors and attachments are out of scope.
 */
export interface Note {
  id: NoteId;
  title: string;
  content: string;
  createdBy: PersonId;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

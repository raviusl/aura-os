import type { PersonId } from "@/types/people";
import type { NoteId } from "./Note";

export type CommentId = string;

/**
 * Comment on a Note. Nested replies use parentCommentId.
 * Soft deletion is represented by deletedAt only — no deletion behavior.
 */
export interface Comment {
  id: CommentId;
  noteId: NoteId;
  parentCommentId: CommentId | null;
  authorId: PersonId;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

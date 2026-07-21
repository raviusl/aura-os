import type { PersonId } from "@/types/people";
import type { CommentId } from "./Comment";

export type CommentMentionId = string;

/**
 * Future mention reference inside a Comment.
 * Examples such as @Ravius / @Planner are delivery concerns, not seed data.
 */
export interface CommentMention {
  id: CommentMentionId;
  commentId: CommentId;
  personId: PersonId;
}

import type { PersonId } from "@/types/people";
import type { CommentId } from "./Comment";

export type CommentReactionId = string;

/**
 * Stable reaction codes for future Comment reactions.
 * Presentation glyphs (👍 ❤️ 🔥 🎉 ✅) are UI concerns.
 */
export const COMMENT_REACTION_CODES = [
  "thumbs_up",
  "heart",
  "fire",
  "party",
  "check",
] as const;

export type CommentReactionCode = (typeof COMMENT_REACTION_CODES)[number];

/**
 * Reaction reference on a Comment.
 */
export interface CommentReaction {
  id: CommentReactionId;
  commentId: CommentId;
  personId: PersonId;
  reactionCode: CommentReactionCode;
  createdAt: string;
}

import type { CommentId } from "./Comment";
import type { NoteId } from "./Note";

/**
 * Hierarchical comment tree node (Project 016 foundation).
 * Supports unlimited nested replies as structure only.
 */
export interface CommentThreadNode {
  commentId: CommentId;
  parentCommentId: CommentId | null;
  children: ReadonlyArray<CommentThreadNode>;
}

/**
 * Comment thread for one Note, rooted at a top-level comment.
 */
export interface CommentThread {
  noteId: NoteId;
  rootCommentId: CommentId;
  nodes: ReadonlyArray<CommentThreadNode>;
}

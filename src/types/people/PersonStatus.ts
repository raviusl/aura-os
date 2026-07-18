/**
 * Human identity lifecycle states (Project 007 foundation).
 * Membership and invitation states are modeled separately.
 */
export const PERSON_STATUSES = ["active", "inactive", "archived"] as const;

export type PersonStatus = (typeof PERSON_STATUSES)[number];

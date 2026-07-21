export type ActivityCategoryId = string;

/**
 * Extensible grouping for related Activity Types.
 */
export interface ActivityCategory {
  id: ActivityCategoryId;
  code: string;
  name: string;
  description: string | null;
}

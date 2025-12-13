import type { Nullable } from '../../types';

/**
 * Casino DB Connection
 * Table: `themes_options`
 */
export interface ThemesOption {
  id: number;
  title: Nullable<string>;
  slug: Nullable<string>;
}

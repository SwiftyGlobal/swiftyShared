import type { Nullable } from '@internal-types/nullable';

export type UserFreeBetUsages = 'sports' | 'cash' | 'casino';

export interface UserFreeBetModel {
  id: number;
  user_id: number;
  bonus_engine_id: Nullable<number>;
  reason: string;
  amount: string;
  amount_used: string;
  end_date: string;
  usage: UserFreeBetUsages;
  turn_requirements: string;
  casino_restrictions: string;
  created_at: string;
  created_by: number;
  modified_at: Nullable<Date>;
  modified_by: Nullable<Date>;
  done: number;
  sport_restrictions: string;
  status: string;
  provider: string;
}

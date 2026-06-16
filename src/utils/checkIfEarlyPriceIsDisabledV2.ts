import moment from 'moment';

import type { MysqlBoolean, Nullable } from '../types';
import { convertMysqlBoolean } from './convertMysqlBoolean';

/**
 * Minimal early-price fields a race competition must expose for the v2 check.
 * Kept structural (not a full `RaceCompetitionModel`) so every service can pass
 * its own competition object without coupling to a shared model.
 */
export interface RaceCompetitionEarlyPriceFields {
  /** Whether early prices are offered for the venue at all (`0` => always SP). */
  early_price_show: MysqlBoolean;
  /** Time of day the early-price window opens, `'HH:mm'` (e.g. `'08:00'`). */
  early_price_start_time: Nullable<string>;
  /**
   * How many days BEFORE the race the early-price window opens.
   * `0` = day of racing (default), `1` = day before, … up to `7`.
   */
  early_price_start_date?: Nullable<number>;
}

export interface CheckIfEarlyPriceIsDisabledV2Params {
  /** Competition-level early-price settings; `null` when the venue has no row. */
  raceCompetition: Nullable<RaceCompetitionEarlyPriceFields>;
  /** Global fallback time when the competition has no `early_price_start_time`. Defaults to `'00:00'`. */
  globalEarlyPriceStartTime?: string;
  /** Global fallback days-before when the competition has no `early_price_start_date`. Defaults to `0`. */
  globalEarlyPriceStartDate?: number;
  /**
   * The race's scheduled start (UTC). The anchor for the days-before window.
   * When omitted, the check falls back to the legacy time-of-day comparison
   * against today (so date-less callers, e.g. sockets, behave as before).
   */
  raceStartTimeUtc?: Nullable<string | Date>;
}

/**
 * Race-date-aware successor to {@link checkIfEarlyPriceIsDisabled}.
 *
 * Early prices for a race become valid at `early_price_start_time` on
 * `(race date − early_price_start_date days)`. Before that moment — or when the
 * venue's `early_price_show` is off — early prices are disabled and the caller
 * should fall back to SP (and hide derivative markets).
 *
 * The competition's own `early_price_start_time` / `early_price_start_date`
 * take precedence over the global fallbacks.
 *
 * @returns `true` when early price is disabled (=> show SP), otherwise `false`.
 *
 * @example
 * ```typescript
 * // Day-of (start_date = 0), 08:00 start. Race tomorrow stays SP today,
 * // regardless of the clock, because its window only opens on race day.
 * checkIfEarlyPriceIsDisabledV2({
 *   raceCompetition: { early_price_show: 1, early_price_start_time: '08:00', early_price_start_date: 0 },
 *   raceStartTimeUtc: '2025-06-11T14:30:00Z', // tomorrow
 * }); // true  (now = 2025-06-10 12:00 < 2025-06-11 08:00)
 *
 * // Day-before (start_date = 1), 18:00 start. The 17/06 race shows early
 * // prices from 18:00 on 16/06.
 * checkIfEarlyPriceIsDisabledV2({
 *   raceCompetition: { early_price_show: 1, early_price_start_time: '18:00', early_price_start_date: 1 },
 *   raceStartTimeUtc: '2025-06-17T13:00:00Z',
 * }); // true before 18:00 on 16/06, false after
 *
 * // No race date => legacy time-of-day fallback (compares against today).
 * checkIfEarlyPriceIsDisabledV2({
 *   raceCompetition: { early_price_show: 1, early_price_start_time: '13:00' },
 * }); // true while now < 13:00 today
 * ```
 */
export const checkIfEarlyPriceIsDisabledV2 = (params: CheckIfEarlyPriceIsDisabledV2Params): boolean => {
  const {
    raceCompetition,
    globalEarlyPriceStartTime = '00:00',
    globalEarlyPriceStartDate = 0,
    raceStartTimeUtc,
  } = params;

  // `early_price_show` off => always SP, no matter the date/time.
  const earlyPriceShow = raceCompetition ? convertMysqlBoolean(raceCompetition.early_price_show) : true;
  if (!earlyPriceShow) {
    return true;
  }

  // Competition overrides the global fallbacks (mirrors the v1 time fallback).
  const startTimeString = (raceCompetition && raceCompetition.early_price_start_time) || globalEarlyPriceStartTime;
  const daysBefore = raceCompetition?.early_price_start_date ?? globalEarlyPriceStartDate ?? 0;

  const now = moment.utc();

  // Date-less callers (e.g. sockets): legacy time-of-day check against today.
  if (!raceStartTimeUtc) {
    return now.isBefore(moment(startTimeString, 'hh:mm').utc(true));
  }

  // Window opens at `startTimeString` on (race date − daysBefore), in UTC.
  const [hours, minutes] = startTimeString.split(':');
  const windowOpensAt = moment
    .utc(raceStartTimeUtc)
    .startOf('day')
    .subtract(daysBefore, 'days')
    .set({ hour: Number(hours), minute: Number(minutes), second: 0, millisecond: 0 });

  return now.isBefore(windowOpensAt);
};

/**
 * Constants and types for "cast" bets (forecast / tricast / exacta / trifecta / swinger)
 * used in horse and greyhound racing.
 *
 * Shared by the auto-settle worker (swiftyPredictionsELBAPI) and any consumer that needs to
 * reason about a cast's outcome. No DB, no logging, no side-effects.
 */

import { BetResultType } from '../common/constants/betResultType';

/**
 * The status a data feed reports for one runner in a settled race.
 *
 * These are the RAW provider-facing values. They are deliberately NOT the same vocabulary as
 * `BetResultType`: the cast calculator compares against these, and only the point of
 * persistence converts them with `raceSelectionMap`. Mixing the two silently disables every
 * non-runner rule (worker card 5679).
 */
export enum RaceSelectionStatus {
  /** selection is a runner */
  RUNNER = 'Runner',
  /** selection is a non-runner, removed from the race before the betting starts */
  NON_RUNNER = 'NonRunner',
  /** selection was pulled up AFTER the betting starts */
  PULLED_UP = 'PulledUp',
  /** selection is a winner */
  WINNER = 'Winner',
  /** selection is placed */
  PLACED = 'Placed',
  /** selection is a loser */
  LOSER = 'Loser',
  /** selection is not available */
  NON_AVAILABLE = 'NonAvailable',
}

/**
 * Converts a provider race status into the `BetResultType` the rest of the platform stores.
 * Apply this ONLY where a leg result is persisted — never before handing selections to the
 * cast calculator.
 */
export const raceSelectionMap = (race_status: string): BetResultType => {
  switch (race_status) {
    case RaceSelectionStatus.NON_RUNNER:
      return BetResultType.VOID;
    case RaceSelectionStatus.PULLED_UP:
      return BetResultType.VOID;
    case RaceSelectionStatus.WINNER:
      return BetResultType.WINNER;
    case RaceSelectionStatus.PLACED:
      return BetResultType.PLACED;
    case RaceSelectionStatus.LOSER:
      return BetResultType.LOSER;
    case RaceSelectionStatus.NON_AVAILABLE:
      return BetResultType.OPEN;
    default:
      return BetResultType.OPEN;
  }
};

/** The outcome of ONE line (combination) of a cast bet. */
export enum CastResultType {
  /** race data not yet available — the bet stays open for re-processing */
  NOT_APPLICABLE = 'not_applicable',
  /** the line matched the finishing order */
  HIT = 'hit',
  /** the line did not match */
  MISSED = 'missed',
  /** the line is void — its selections were all non-runners — stake refunded */
  VOID = 'void',
  /** the line has a non-runner and its survivor won — pays as a win single at the survivor's odd */
  SINGLE = 'single',
  /** a tricast line lost one selection to a non-runner — pays as a forecast on the survivors */
  FORECAST = 'forecast',
}

/**
 * Feed event/race statuses that mean the race was abandoned or voided (never run), per
 * provider: "d" (PA Media), "c" (SIS), "h" (RAS). Mirrors the per-feed abandoned handlers
 * (PAEventAbandoned / SISEventAbandoned / RASEventAbandoned) which void the single legs;
 * the cast worker uses the same set to void the whole cast market.
 */
export const ABANDONED_EVENT_STATUSES: Record<string, string[]> = {
  d: ['Abandoned', 'RaceVoid', 'Race Void'],
  c: ['A', 'V'],
  h: ['ABANDONED'],
};

/**
 * Minimum runners required for a TRICAST market specifically, on top of the 3-runner minimum
 * that every cast market has. 0 = disabled, which is today's behaviour. See
 * `shouldVoidCastForFieldSize`: enabling this voids tricasts on small fields and needs a
 * Trading decision first.
 */
export const TRICAST_MIN_RUNNERS = 0;

/** A selection id. Bet ids arrive as strings; feed position ids arrive as numbers. */
export type CastSelectionId = string | number;

/** One of the punter's selections, with the odd to pay a single fallback at and its race status. */
export interface CastBet {
  selection_id: CastSelectionId;
  /** SP / placed odd for this selection — arrives as a DB decimal string in production */
  odd?: number | string;
  /** RAW `RaceSelectionStatus` value from the feed — never a mapped `BetResultType` */
  status?: string;
  /** `user_bets_single.id`, carried through so the caller can write the leg result back */
  id?: number | string;
}

/** One actual finishing position from the race feed. */
export interface RacePosition {
  selection_id: CastSelectionId;
  position: number | string;
}

/** The settled outcome of one line of the bet. */
export interface CastLineResult {
  stake: number | string;
  odd: number | string;
  result: CastResultType;
  /** set on SINGLE lines: which selection the win single is paid on */
  selection_id?: CastSelectionId;
}

/** Per-combination dividends keyed by `id_id[_id]`, from the tote feed or a trader entry. */
export type ManualWinningCombos = Map<string, number | string>;

/** Arguments accepted by every calculator method. Each destructures only what it needs. */
export interface CastCalcParams {
  prefix?: string;
  betted_id?: number | string;
  bets: CastBet[];
  selections: RacePosition[];
  bet_type?: string;
  /** the tote dividend for THIS cast type — the HIT multiplier */
  dividend?: number | string;
  /** the race's forecast (CSF) dividend — prices a tricast that degraded to a forecast */
  forecastDividend?: number | string | null;
  /** stake per combination, NOT the total stake */
  stake: number | string;
  total_stake?: number | string;
  manualWinningCombos?: ManualWinningCombos | null;
}

/** What each individual calculator returns. */
export interface CastCalcOutput {
  bets: CastBet[];
  selections: RacePosition[];
  results: CastLineResult[];
}

/**
 * What `calculateCasts` returns: the lines plus the aggregated bet-level outcome.
 *
 * `results` is empty only when `bet_type` matched no calculator, which also leaves
 * `mainResult` OPEN — callers treat both the same way (nothing to settle yet).
 */
export interface CastCalculateResult {
  bets: CastBet[];
  selections: RacePosition[];
  results: CastLineResult[];
  winAmount: number;
  mainResult: BetResultType;
}

/** One generated line of a combination bet, before it is priced. */
export interface GeneratedCastLine {
  combination: CastSelectionId[];
  outcome: CastResultType;
  /** the winning selection for SINGLE outcomes; 0 otherwise */
  selection_id: CastSelectionId;
}

/** Log sink. Matches the worker's `showLogs` so its output is unchanged. */
export type CastLogger = (entry: { prefix?: string; m: string }) => void;

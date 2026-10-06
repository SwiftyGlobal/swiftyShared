/**
 * CastCalculator
 *
 * Settlement logic for "cast" bet types used in horse/greyhound racing:
 *
 *   - Forecast (exacta):     Pick 1st and 2nd in exact order
 *   - Reverse Forecast:      Pick 1st and 2nd in any order (2 combinations)
 *   - Forecast Combination:  Pick multiple runners, all 2-permutation combos are generated (max 6 runners)
 *   - Tricast (trifecta):    Pick 1st, 2nd, and 3rd in exact order
 *   - Tricast Combination:   Pick multiple runners, all 3-permutation combos are generated (max 6 runners)
 *   - Swinger:               Pick 2 runners to both finish in top 3, any order
 *
 * Key concepts:
 *   - "bets"       = the player's selections, each with a selection_id, odd (SP), and status (Winner/Loser/NonRunner/etc.)
 *   - "selections" = the actual race finishing positions, ordered by position (1st, 2nd, 3rd...)
 *   - "dividend"   = the tote pool payout for this cast type (e.g. the forecast dividend from cast_return)
 *   - "stake"      = the stake per combination (not the total stake)
 *
 * Cast result types (per combination):
 *   - HIT:            Selections match the finishing order exactly → pays stake * dividend
 *   - MISSED:         Selections don't match → pays 0
 *   - VOID:           All selections are non-runners → refunds stake (stake * 1)
 *   - SINGLE:         One selection is a non-runner, the other is a winner → pays stake * winner's SP odd
 *   - FORECAST:       Tricast with 1 non-runner, remaining 2 match 1st & 2nd → falls back to forecast payout
 *   - NOT_APPLICABLE: Race data not yet available → bet stays open for re-processing
 *
 * Main bet result (aggregated from all combinations):
 *   - WINNER:  All combos are HIT (or at least one HIT with no SINGLE/VOID)
 *   - PARTIAL: Mix of HIT/SINGLE/VOID results
 *   - VOID:    All combos are VOID
 *   - LOSER:   All combos are MISSED
 *   - OPEN:    Some combos still NOT_APPLICABLE (waiting for data)
 *
 * Pure: no DB, no IO. The only outside contact is an injectable logger, so the auto-settle
 * worker keeps its existing log output.
 */

import { BetResultType } from '../common/constants/betResultType';
import type {
  CastBet,
  CastCalcOutput,
  CastCalcParams,
  CastCalculateResult,
  CastLineResult,
  CastLogger,
  CastSelectionId,
  GeneratedCastLine,
  ManualWinningCombos,
  RacePosition,
} from './castConstants';
import { ABANDONED_EVENT_STATUSES, CastResultType, RaceSelectionStatus, TRICAST_MIN_RUNNERS } from './castConstants';

export class CastCalculator {
  private readonly logger: CastLogger;

  constructor(logger?: CastLogger) {
    this.logger = logger ?? (() => undefined);
  }

  private showLogs(entry: { prefix?: string; m: string }): void {
    this.logger(entry);
  }

  /**
   * True when a selection's status means "we cannot judge this bet yet".
   *
   * NOTE: the original guard read `status === RaceSelectionStatus.NON_AVAILABLE || status ===
   * RaceSelectionStatus.OPEN`, but `OPEN` has never been a key on that constant, so the second
   * arm has always compared against `undefined` — it catches a selection carrying NO status at
   * all, not a literal "open". Preserved exactly: introducing an OPEN status here would change
   * which bets are held pending rather than graded.
   */
  private isUnknownStatus(status: string | undefined): boolean {
    return status === RaceSelectionStatus.NON_AVAILABLE || status === undefined;
  }

  /**
   * Field-size market void.
   *
   * A cast market is only valid with at least 3 runners that actually took part
   * (declared minus non-runners/scratched). Below that, the whole market is void
   * and every bet on it is refunded, regardless of the player's result.
   *
   * Applies to all cast bet types — forecast (forecast_*, exacta, swinger) and
   * tricast (tricast_*, trifecta) — in BOTH horse and greyhound racing.
   * Strictly less-than: exactly 3 runners does NOT void.
   *
   * @param bet_type - The cast bet type.
   * @param totalRealRunners - Count of runners that took part in the race.
   * @returns true if the bet must be voided due to field size.
   */
  shouldVoidCastForFieldSize({
    bet_type,
    totalRealRunners,
    tricastMinRunners = TRICAST_MIN_RUNNERS,
  }: {
    bet_type: string;
    totalRealRunners: number | string;
    tricastMinRunners?: number | string;
  }): boolean {
    const isCast =
      bet_type.includes('forecast') ||
      bet_type.includes('tricast') ||
      bet_type === 'exacta' ||
      bet_type === 'trifecta' ||
      bet_type === 'swinger';
    if (!isCast) return false;

    const runners = Number(totalRealRunners);
    if (runners < 3) return true; // every cast market needs at least 3 runners

    // Tricast-only minimum. Industry practice is that a tricast is offered only in races with a
    // larger field (commonly 8+ in handicaps), and that if non-runners drag the field below it the
    // tricasts are voided and refunded — though some books instead settle them as straight
    // forecasts, so the behaviour is a house rule, not a given.
    //
    // DISABLED BY DEFAULT (TRICAST_MIN_RUNNERS = 0). Turning it on retroactively voids tricasts on
    // small fields, INCLUDING ones that currently win and pay out, so it needs Trading to supply
    // both the threshold and the choice of void-vs-settle-as-forecast before it is switched on.
    const isTricast = bet_type.includes('tricast') || bet_type === 'trifecta';
    if (isTricast && Number(tricastMinRunners) > 0 && runners < Number(tricastMinRunners)) return true;

    return false;
  }

  /**
   * Abandoned / void market void.
   *
   * An abandoned or voided race is never run, so the provider never declares a cast
   * dividend (empty cast_return / race_bets / dividends). The normal win/lose path can
   * then neither pay nor void the bet, so it stays open and is re-processed every cycle
   * forever (Trello 5654). This voids the whole market and refunds the stake, independent
   * of the declared runner count — unlike the field-size gate, an abandoned race can still
   * have 3+ declared runners, so that gate never catches it.
   *
   * @param bet_provider - "d" (PA Media), "c" (SIS), "h" (RAS) or "r" (Swifty feed racing).
   * @param status - The provider event/race status from getEventDetails.
   * @returns true if the event is abandoned/void and the cast must be voided.
   */
  shouldVoidCastForAbandonedEvent({
    bet_provider,
    status,
  }: {
    bet_provider: string;
    status: string | number | null | undefined;
  }): boolean {
    const statuses = ABANDONED_EVENT_STATUSES[bet_provider];
    return Boolean(statuses && status != null && statuses.includes(String(status)));
  }

  /**
   * Main entry point — routes to the correct calculator based on bet_type,
   * then determines the overall bet result (WINNER/PARTIAL/VOID/LOSER/OPEN).
   */
  calculateCasts({
    prefix,
    betted_id,
    bets,
    selections,
    bet_type,
    dividend,
    forecastDividend,
    stake,
    total_stake,
    manualWinningCombos,
  }: CastCalcParams): CastCalculateResult {
    let calc: CastCalcOutput | null = null;
    let winAmount = 0;
    let mainResult: BetResultType = BetResultType.OPEN;

    // ─── FORECAST SINGLE / EXACTA ─────────────────────────────────────
    // Player picks 1st and 2nd in exact order. Single combination.
    if (['forecast_single', 'forecast', 'exacta'].includes(String(bet_type))) {
      calc = this.calculateForecast({
        prefix,
        betted_id,
        bets,
        selections,
        dividend,
        stake,
        total_stake,
        manualWinningCombos,
      });

      // winAmount = sum of (stake * odd) for each combination result
      winAmount = this.sumWinAmount(calc.results);

      // Determine main result: priority order matters — check most specific first
      if (calc.results.every((r) => r.result === CastResultType.HIT)) {
        mainResult = BetResultType.WINNER; // All combinations hit
      } else if (
        calc.results.some((r) => r.result === CastResultType.SINGLE) ||
        calc.results.some((r) => r.result === CastResultType.HIT)
      ) {
        mainResult = BetResultType.PARTIAL; // Mix of hits and non-runner fallbacks
      } else if (calc.results.every((r) => r.result === CastResultType.VOID)) {
        mainResult = BetResultType.VOID; // All selections were non-runners → refund
      } else if (calc.results.every((r) => r.result === CastResultType.MISSED)) {
        mainResult = BetResultType.LOSER; // Wrong selections
      } else if (calc.results.some((r) => r.result === CastResultType.NOT_APPLICABLE)) {
        mainResult = BetResultType.OPEN; // Still waiting for race data
      }

      // ─── REVERSE FORECAST ──────────────────────────────────────────────
      // Player picks 2 runners to finish 1st and 2nd in any order.
      // Generates 2 combinations: A→B and B→A. Only one can HIT.
    } else if (['reverse_forecast_single', 'reverse_forecast', 'forecast_reverse'].includes(String(bet_type))) {
      calc = this.calculateReverseForecast({
        prefix,
        betted_id,
        bets,
        selections,
        dividend,
        stake,
        total_stake,
        manualWinningCombos,
      });

      winAmount = this.sumWinAmount(calc.results);

      // WINNER if any combo HIT: normally one ordering hits; on a dead-heat for 1st
      // both orderings hit (each reduced). Non-runner fallbacks settle as SINGLE.
      if (calc.results.some((r) => r.result === CastResultType.HIT)) {
        mainResult = BetResultType.WINNER;
      } else if (calc.results.some((r) => r.result === CastResultType.SINGLE)) {
        mainResult = BetResultType.PARTIAL; // Non-runner fallback to single
      } else if (calc.results.every((r) => r.result === CastResultType.VOID)) {
        mainResult = BetResultType.VOID; // Both selections non-runners
      } else if (calc.results.every((r) => r.result === CastResultType.MISSED)) {
        mainResult = BetResultType.LOSER; // Neither selection in top 2
      } else if (calc.results.some((r) => r.result === CastResultType.NOT_APPLICABLE)) {
        mainResult = BetResultType.OPEN;
      }

      // ─── FORECAST COMBINATION ──────────────────────────────────────────
      // Player picks 3+ runners (max 6). All possible 2-permutation combos are generated.
      // E.g. 3 runners → 6 combos (A→B, A→C, B→A, B→C, C→A, C→B)
    } else if (['forecast_combination'].includes(String(bet_type))) {
      calc = this.calculateForecastCombination({
        prefix,
        betted_id,
        bets,
        selections,
        dividend,
        stake,
        total_stake,
        manualWinningCombos,
      });

      winAmount = this.sumWinAmount(calc.results);

      // IMPORTANT: Check "all VOID" BEFORE "some VOID" — otherwise PARTIAL would catch all-void scenarios
      if (
        calc.results.some((r) => r.result === CastResultType.HIT) &&
        calc.results.every((r) => r.result != CastResultType.SINGLE) &&
        calc.results.every((r) => r.result != CastResultType.VOID)
      ) {
        mainResult = BetResultType.WINNER; // At least one combo hit, no non-runner complications
      } else if (calc.results.every((r) => r.result === CastResultType.VOID)) {
        mainResult = BetResultType.VOID; // All combos voided (all runners are non-runners)
      } else if (
        calc.results.some((r) => r.result === CastResultType.SINGLE) ||
        calc.results.some((r) => r.result === CastResultType.HIT) ||
        calc.results.some((r) => r.result === CastResultType.VOID)
      ) {
        mainResult = BetResultType.PARTIAL; // Mix of results including some non-runner fallbacks
      } else if (calc.results.every((r) => r.result === CastResultType.MISSED)) {
        mainResult = BetResultType.LOSER;
      } else if (calc.results.some((r) => r.result === CastResultType.NOT_APPLICABLE)) {
        mainResult = BetResultType.OPEN;
      }

      // ─── TRICAST SINGLE / TRIFECTA ────────────────────────────────────
      // Player picks 1st, 2nd, and 3rd in exact order. Single combination.
      // Non-runner fallback: 2 NR → single, 1 NR → forecast (remaining 2 must match 1st & 2nd)
    } else if (['tricast_single', 'tricast', 'trifecta'].includes(String(bet_type))) {
      calc = this.calculateTricast({
        prefix,
        betted_id,
        bets,
        selections,
        dividend,
        forecastDividend,
        stake,
        total_stake,
        manualWinningCombos,
      });

      winAmount = this.sumWinAmount(calc.results);

      if (
        calc.results.some((r) => r.result === CastResultType.HIT) &&
        calc.results.every((r) => r.result != CastResultType.SINGLE) &&
        calc.results.every((r) => r.result != CastResultType.VOID)
      ) {
        mainResult = BetResultType.WINNER;
      } else if (calc.results.every((r) => r.result === CastResultType.VOID)) {
        mainResult = BetResultType.VOID; // All 3 selections were non-runners
      } else if (calc.results.every((r) => r.result === CastResultType.MISSED)) {
        mainResult = BetResultType.LOSER;
      } else if (
        calc.results.some((r) => r.result === CastResultType.SINGLE) || // 2 NR, 1 winner → single fallback
        calc.results.some((r) => r.result === CastResultType.HIT) ||
        calc.results.some((r) => r.result === CastResultType.VOID) ||
        calc.results.some((r) => r.result === CastResultType.FORECAST) // 1 NR, remaining 2 match → forecast fallback
      ) {
        mainResult = BetResultType.PARTIAL;
      } else if (calc.results.some((r) => r.result === CastResultType.NOT_APPLICABLE)) {
        mainResult = BetResultType.OPEN;
      }

      // ─── TRICAST COMBINATION ───────────────────────────────────────────
      // Player picks 4+ runners (max 6). All possible 3-permutation combos are generated.
      // E.g. 4 runners → 24 combos. Each combo checked independently.
    } else if (['tricast_combination'].includes(String(bet_type))) {
      calc = this.calculateTricastCombination({
        prefix,
        betted_id,
        bets,
        selections,
        dividend,
        forecastDividend,
        stake,
        total_stake,
        manualWinningCombos,
      });

      winAmount = this.sumWinAmount(calc.results);

      // IMPORTANT: Check "all VOID" BEFORE partial checks — same ordering fix as forecast_combination
      if (
        calc.results.some((r) => r.result === CastResultType.HIT) &&
        calc.results.every((r) => r.result != CastResultType.SINGLE) &&
        calc.results.every((r) => r.result != CastResultType.VOID) &&
        calc.results.every((r) => r.result != CastResultType.FORECAST)
      ) {
        mainResult = BetResultType.WINNER;
      } else if (calc.results.every((r) => r.result === CastResultType.VOID)) {
        mainResult = BetResultType.VOID; // All combos voided
      } else if (
        calc.results.some((r) => r.result === CastResultType.SINGLE) ||
        calc.results.some((r) => r.result === CastResultType.FORECAST)
      ) {
        mainResult = BetResultType.PARTIAL; // Some combos fell back to single/forecast
      } else if (calc.results.every((r) => r.result === CastResultType.MISSED)) {
        mainResult = BetResultType.LOSER;
      } else if (calc.results.some((r) => r.result === CastResultType.NOT_APPLICABLE)) {
        mainResult = BetResultType.OPEN;
      }

      // ─── SWINGER ───────────────────────────────────────────────────────
      // Player picks 2 runners to both finish in the top 3, in any order.
      // Single combination. Uses isTopPositions() instead of areIdentical().
    } else if (['swinger'].includes(String(bet_type))) {
      calc = this.calculateSwinger({ betted_id, bets, selections, dividend, stake, prefix });

      winAmount = this.sumWinAmount(calc.results);

      if (calc.results.some((r) => r.result === CastResultType.HIT)) {
        mainResult = BetResultType.WINNER; // Both selections in top 3
      } else if (calc.results.some((r) => r.result === CastResultType.SINGLE)) {
        mainResult = BetResultType.PARTIAL; // 1 NR, other is winner → single fallback
      } else if (calc.results.some((r) => r.result === CastResultType.VOID)) {
        mainResult = BetResultType.VOID; // Both selections are non-runners
      } else if (calc.results.some((r) => r.result === CastResultType.MISSED)) {
        mainResult = BetResultType.LOSER; // Selections not in top 3
      } else if (calc.results.some((r) => r.result === CastResultType.NOT_APPLICABLE)) {
        mainResult = BetResultType.OPEN;
      }
    }

    this.showLogs({
      prefix,
      m:
        'Calculate Casts - Betted ID: ' +
        betted_id +
        ' - Main Result: ' +
        mainResult +
        ' - Bet Type: ' +
        bet_type +
        ' - Win Amount: ' +
        winAmount +
        ' - ' +
        JSON.stringify(calc),
    });

    return {
      bets,
      selections,
      results: calc?.results ?? [],
      winAmount,
      mainResult,
    };
  }

  /** Sum of stake x odd across every line — a line's contribution to the payout. */
  private sumWinAmount(results: CastLineResult[] | undefined): number {
    return (results ?? []).reduce((acc, curr) => acc + Number(curr.stake) * Number(curr.odd), 0);
  }

  /**
   * Line accounting for a settled cast — used for the free-bet SNR deduction.
   *
   * A cast is one bet row but N lines: forecast/tricast single = 1, reverse forecast = 2
   * orderings, forecast/tricast combination = every ordered permutation of the punter's
   * selections. `winAmount` is the sum of stake x odd across those lines, so a free bet's
   * "stake not returned" deduction must be the free stake of the lines that actually
   * returned money — deducting the whole free stake once under-pays every multi-line cast.
   *
   * A line counts as returning money when stake x odd > 0, which is exactly its contribution
   * to winAmount: HIT, VOID (stake refunded at odd 1), and the SINGLE / FORECAST non-runner
   * fallbacks all count; MISSED and NOT_APPLICABLE do not. Counting VOID lines keeps a free
   * bet consistent with settleAsVoid, which refunds no cash when the stake was a free bet.
   *
   * Returns winningLineCount: null when there is nothing to count from, so the caller falls
   * back to deducting the whole free stake and can never over-credit.
   */
  castLineCounts(results: CastLineResult[] | undefined): { totalLines: number; winningLineCount: number | null } {
    if (!Array.isArray(results) || results.length === 0) {
      return { totalLines: 0, winningLineCount: null };
    }
    return {
      totalLines: results.length,
      winningLineCount: results.filter((r) => Number(r.stake) * Number(r.odd) > 0).length,
    };
  }

  /**
   * Forecast Single / Exacta
   *
   * Player picks exactly 2 runners in exact finishing order (1st, 2nd).
   * Returns a single result: HIT, MISSED, VOID, SINGLE, or NOT_APPLICABLE.
   *
   * Non-runner rules:
   *   - 2 non-runners → VOID (refund stake at odd 1)
   *   - 1 non-runner + 1 winner → SINGLE (pay at winner's SP odd)
   *   - 1 non-runner + 1 non-winner → MISSED (loss)
   */
  calculateForecast({
    betted_id,
    bets,
    selections,
    dividend,
    stake,
    prefix,
    manualWinningCombos,
  }: CastCalcParams): CastCalcOutput {
    const hasNonRunner = bets.some((r) => r.status === RaceSelectionStatus.NON_RUNNER);
    const hasUnknown = bets.some((r) => r.status === RaceSelectionStatus.NON_AVAILABLE);

    // ── All runners present: dead-heat-aware HIT / MISS ──
    // straightCastHitOdd returns this line's own dividend (the per-combination dividend
    // when the tote/trader declared one, else the single event dividend) or null when
    // the bet loses. No dead-heat reduction — see deadHeatModel.
    if (!hasNonRunner && !hasUnknown) {
      const odd = this.straightCastHitOdd(bets, selections, 2, dividend, manualWinningCombos);
      if (odd !== null) {
        this.showLogs({ prefix, m: 'Forecast HIT (dead-heat aware) - Betted ID: ' + betted_id + ' - odd: ' + odd });
        return { bets, selections, results: [{ stake, odd, result: CastResultType.HIT }] };
      }
      this.showLogs({ prefix, m: 'Forecast has 2 Runners, Missed Result: ' + betted_id });
      return { bets, selections, results: [{ stake, odd: 0, result: CastResultType.MISSED }] };
    }

    // ── Unknown status: keep the bet open for re-processing ──
    if (hasUnknown) {
      this.showLogs({ prefix, m: 'Non Available Selections Status - Betted ID: ' + betted_id });
      return { bets, selections, results: [{ stake, odd: 0, result: CastResultType.NOT_APPLICABLE }] };
    }

    // ── Non-runner fallbacks (unchanged) ──
    const noVoidedSelections = bets.filter((r) => r.status === RaceSelectionStatus.NON_RUNNER).length;

    // Both selections are non-runners → void the bet, refund stake
    if (noVoidedSelections == 2) {
      this.showLogs({ prefix, m: 'Forecast has been pushed - Betted ID: ' + betted_id });
      return { bets, selections, results: [{ stake, odd: 1, result: CastResultType.VOID }] };
    } else if (noVoidedSelections == 1) {
      // One non-runner → check if the remaining selection won the race
      const foundResultedSelection = bets.find((r) => r.status === RaceSelectionStatus.WINNER);
      if (foundResultedSelection) {
        // Remaining selection is the race winner → pay as a single bet at their SP odd
        this.showLogs({ prefix, m: 'Forecast has Non Runner and Winner - Betted ID: ' + betted_id });
        return {
          bets,
          selections,
          results: [{ stake, odd: foundResultedSelection.odd ?? 0, result: CastResultType.SINGLE }],
        };
      }
      // Remaining selection didn't win → lost bet
      this.showLogs({ prefix, m: 'Forecast has Non Runner and No Winner - Betted ID: ' + betted_id });
      return { bets, selections, results: [{ stake, odd: 0, result: CastResultType.MISSED }] };
    }
    this.showLogs({ prefix, m: 'Forecast Missed Result: ' + betted_id });
    return { bets, selections, results: [{ stake, odd: 0, result: CastResultType.MISSED }] };
  }

  /**
   * Reverse Forecast
   *
   * Player picks 2 runners to finish 1st and 2nd in ANY order.
   * Internally this is treated as 2 combinations (A→B and B→A).
   * Returns 2 results — on a win, one will be HIT and the other MISSED.
   *
   * Non-runner rules: same as forecast but applied to both combinations.
   */
  calculateReverseForecast({
    betted_id,
    bets,
    selections,
    dividend,
    stake,
    prefix,
    manualWinningCombos,
  }: CastCalcParams): CastCalcOutput {
    this.showLogs({
      prefix,
      m:
        'Reverse Forecast - Betted ID: ' +
        betted_id +
        ' - Bets: ' +
        JSON.stringify(bets) +
        ' - Selections: ' +
        JSON.stringify(selections),
    });

    const hasNonRunner = bets.some((r) => r.status === RaceSelectionStatus.NON_RUNNER);
    const hasUnknown = bets.some((r) => r.status === RaceSelectionStatus.NON_AVAILABLE);

    // ── All runners present: dead-heat-aware per-ordering payout ──
    // Each of the reverse's two orderings that is a winning permutation pays its own
    // per-combination dividend in full — no 1/N reduction, the tote already applied it
    // (see deadHeatModel). On a clean result only the actual finishing order wins (the
    // other ordering loses); on a dead-heat for 1st both lines win and both dividends
    // are paid. Driven by deadHeatModel — independent of how many runners share the top
    // placings — so a 3-way dead-heat or a tie for 2nd settles correctly.
    if (!hasNonRunner && !hasUnknown) {
      const { winningPerms } = this.deadHeatModel(selections, 2);
      const results = this.permutationsOf(
        bets.map((b) => b.selection_id),
        2,
      ).map((o) =>
        winningPerms.some((p) => this.areIdentical(p, o))
          ? { stake, odd: this.permDividend(o, manualWinningCombos, dividend), result: CastResultType.HIT }
          : { stake, odd: 0, result: CastResultType.MISSED },
      );
      this.showLogs({
        prefix,
        m:
          'Reverse Forecast HIT (dead-heat aware) - Betted ID: ' +
          betted_id +
          ' - odds: ' +
          JSON.stringify(results.map((r) => r.odd)),
      });
      return { bets, selections, results };
    }

    // ── Unknown status: keep both combos open for re-processing ──
    if (hasUnknown) {
      return {
        bets,
        selections,
        results: [
          { stake, odd: 0, result: CastResultType.NOT_APPLICABLE },
          { stake, odd: 0, result: CastResultType.NOT_APPLICABLE },
        ],
      };
    }

    // ── Non-runner fallbacks (unchanged) ──
    const noVoidedSelections = bets.filter((r) => r.status === RaceSelectionStatus.NON_RUNNER).length;

    // Both non-runners → void both combinations, refund stake for each
    if (noVoidedSelections == 2) {
      this.showLogs({ prefix, m: 'Reverse Forecast has been pushed - Betted ID: ' + betted_id });
      return {
        bets,
        selections,
        results: [
          { stake, odd: 1, result: CastResultType.VOID },
          { stake, odd: 1, result: CastResultType.VOID },
        ],
      };
    }

    // One non-runner → both combos fall back to single at the winner's SP odd
    const foundResultedSelection = bets.find((r) => r.status === RaceSelectionStatus.WINNER);
    if (foundResultedSelection) {
      this.showLogs({ prefix, m: 'Reverse Forecast has Non Runner and Winner - Betted ID: ' + betted_id });
      return {
        bets,
        selections,
        results: [
          { stake, odd: foundResultedSelection.odd ?? 0, result: CastResultType.SINGLE },
          { stake, odd: foundResultedSelection.odd ?? 0, result: CastResultType.SINGLE },
        ],
      };
    }
    // One NR but remaining selection didn't win → both combos lost
    this.showLogs({ prefix, m: 'Reverse Forecast has Non Runner and No Winner - Betted ID: ' + betted_id });
    return {
      bets,
      selections,
      results: [
        { stake, odd: 0, result: CastResultType.MISSED },
        { stake, odd: 0, result: CastResultType.MISSED },
      ],
    };
  }

  /**
   * Forecast Combination
   *
   * Player picks 3-6 runners. All possible ordered 2-permutation combinations are generated.
   * E.g. 3 runners (A, B, C) → 6 combos: A→B, A→C, B→A, B→C, C→A, C→B.
   * Max 6 runners allowed (= 30 combos).
   *
   * Each combination is independently checked against the actual 1st and 2nd finishers.
   * The player pays stake per combination.
   *
   * Non-runner rules applied per combination:
   *   - Both in combo are NR → VOID that combo
   *   - One NR + one WINNER → SINGLE (pay at winner's SP)
   *   - One NR + one non-winner → MISSED
   */
  calculateForecastCombination({
    prefix,
    betted_id,
    bets,
    selections,
    dividend,
    stake,
    manualWinningCombos,
  }: CastCalcParams): CastCalcOutput {
    // If any selection status is still unknown, keep the bet open
    if (bets.some((r) => this.isUnknownStatus(r.status))) {
      return {
        bets,
        selections,
        results: [{ stake, odd: 0, result: CastResultType.NOT_APPLICABLE }],
      };
    }

    // ── All runners present: dead-heat-aware per-combination payout ──
    // Each ordered 2-permutation of the punter's selections that is a winning ordering
    // pays its own per-combination dividend in full (no 1/N — see deadHeatModel). On a
    // clean result only the actual finishing order hits. Non-runner cases use the legacy path.
    if (!bets.some((r) => r.status === RaceSelectionStatus.NON_RUNNER)) {
      const { winningPerms } = this.deadHeatModel(selections, 2);
      const results = this.permutationsOf(
        bets.map((b) => b.selection_id),
        2,
      ).map((o) =>
        winningPerms.some((p) => this.areIdentical(p, o))
          ? { stake, odd: this.permDividend(o, manualWinningCombos, dividend), result: CastResultType.HIT }
          : { stake, odd: 0, result: CastResultType.MISSED },
      );
      this.showLogs({ prefix, m: 'Forecast Combination HIT (dead-heat aware) - Betted ID: ' + betted_id });
      return { bets, selections, results };
    }

    // Generate all 2-permutation combinations and evaluate each against actual results
    const combinations = this.generateForecastResults(bets, selections);

    this.showLogs({
      prefix,
      m:
        'Forecast Combination - Betted ID: ' + betted_id + ' - Generated Combinations: ' + JSON.stringify(combinations),
    });

    // Map each generated combination to a payout result
    const returns: CastLineResult[] = combinations.map((r) => {
      if (r.outcome === CastResultType.HIT) {
        // Combination matches 1st & 2nd in exact order → pay the tote dividend
        return {
          stake,
          odd: dividend ?? 0,
          result: CastResultType.HIT,
        };
      } else if (r.outcome === CastResultType.SINGLE) {
        // One selection was NR, the other won → pay at winner's individual SP odd
        return {
          stake,
          odd: bets.find((b) => b.selection_id === r.selection_id)!.odd ?? 0,
          selection_id: r.selection_id,
          result: CastResultType.SINGLE,
        };
      } else if (r.outcome === CastResultType.MISSED) {
        // Combination didn't match → loss
        return {
          stake,
          odd: 0,
          result: CastResultType.MISSED,
        };
      } else if (r.outcome === CastResultType.VOID) {
        // Both selections in this combo are non-runners → refund stake
        return {
          stake,
          odd: 1,
          result: CastResultType.VOID,
        };
      } else {
        // Fallback for unexpected states
        return {
          stake,
          odd: 0,
          result: CastResultType.MISSED,
        };
      }
    });

    return {
      bets,
      selections,
      results: returns,
    };
  }

  /**
   * Tricast Single / Trifecta
   *
   * Player picks 1st, 2nd, and 3rd in exact order. Single combination.
   *
   * Non-runner fallback rules (progressive degradation):
   *   - 3 non-runners → VOID (refund stake)
   *   - 2 non-runners → SINGLE (remaining selection must be the winner, pays at SP odd)
   *   - 1 non-runner  → FORECAST (remaining 2 must match 1st & 2nd exactly, pays at the CSF dividend)
   *   - 0 non-runners → must match all 3 positions exactly for HIT
   */
  calculateTricast({
    betted_id,
    bets,
    selections,
    dividend,
    forecastDividend,
    stake,
    prefix,
    manualWinningCombos,
  }: CastCalcParams): CastCalcOutput {
    // If any selection status is still unknown, keep the bet open
    if (bets.some((r) => this.isUnknownStatus(r.status))) {
      return {
        bets,
        selections,
        results: [{ stake, odd: 0, result: CastResultType.NOT_APPLICABLE }],
      };
    }

    // ── All runners present: dead-heat-aware HIT / MISS ──
    // Pays this line's own dividend when the punter's exact order is a winning ordering
    // (dead-heats make the tied places interchangeable); no dead-heat reduction.
    if (!bets.some((r) => r.status === RaceSelectionStatus.NON_RUNNER)) {
      const odd = this.straightCastHitOdd(bets, selections, 3, dividend, manualWinningCombos);
      if (odd !== null) {
        this.showLogs({ prefix, m: 'Tricast HIT (dead-heat aware) - Betted ID: ' + betted_id + ' - odd: ' + odd });
        return { bets, selections, results: [{ stake, odd, result: CastResultType.HIT }] };
      }
      this.showLogs({ prefix, m: 'Tricast 3 Runners Missed - Betted ID: ' + betted_id });
      return { bets, selections, results: [{ stake, odd: 0, result: CastResultType.MISSED }] };
    }

    const noVoidedSelections = bets.filter((r) => r.status === RaceSelectionStatus.NON_RUNNER).length;

    // All 3 selections are non-runners → void, refund stake
    if (noVoidedSelections == 3) {
      this.showLogs({ prefix, m: 'Tricast has been pushed - Betted ID: ' + betted_id + ' - ' + JSON.stringify(bets) });
      return { bets, selections, results: [{ stake, odd: 1, result: CastResultType.VOID }] };
    }

    // 2 non-runners → treat the remaining selection as a single bet
    if (noVoidedSelections == 2) {
      this.showLogs({
        prefix,
        m: 'Tricast has 2 pushed - Treat as single - Betted ID: ' + betted_id + ' - ' + JSON.stringify(bets),
      });
      const foundResultedSelection = bets.find((r) => r.status === RaceSelectionStatus.WINNER);

      if (foundResultedSelection) {
        // Remaining selection is a winner → pay at their individual SP odd
        this.showLogs({
          prefix,
          m: 'Forecast has Non Runner and Winner - Betted ID: ' + betted_id + ' - ' + JSON.stringify(bets),
        });
        return {
          bets,
          selections,
          results: [{ stake, odd: foundResultedSelection.odd ?? 0, result: CastResultType.SINGLE }],
        };
      } else {
        // Remaining selection didn't win → loss
        this.showLogs({
          prefix,
          m: 'Forecast has Non Runner and No Winner - Betted ID: ' + betted_id + ' - ' + JSON.stringify(bets),
        });
        return { bets, selections, results: [{ stake, odd: 0, result: CastResultType.MISSED }] };
      }
    }

    // 1 non-runner → treat the remaining 2 as a forecast bet
    // They must match the 1st and 2nd positions in exact order
    if (noVoidedSelections == 1) {
      this.showLogs({
        prefix,
        m: 'Tricast has 1 pushed - Treat as forecast - Betted ID: ' + betted_id + ' - ' + JSON.stringify(bets),
      });

      // Get the 2 remaining runners (exclude the NR) and compare with 1st & 2nd finishers
      if (
        this.areIdentical(
          bets.filter((r) => r.status !== RaceSelectionStatus.NON_RUNNER).map((r) => r.selection_id),
          selections.map((r) => r.selection_id).slice(0, 2),
        )
      ) {
        // Remaining 2 match 1st & 2nd in the punter's original order → CSF fallback.
        // Paid at the race's FORECAST dividend. If it isn't available yet we must NOT fall back
        // to the tricast dividend (far larger — a straight over-pay), so hold the line pending
        // and let the bet re-grade once the CSF dividend lands.
        if (!(Number(forecastDividend) > 0)) {
          this.showLogs({
            prefix,
            m:
              'Tricast has 1 pushed - forecast (CSF) dividend not available yet - leaving pending - Betted ID: ' +
              betted_id,
          });
          return { bets, selections, results: [{ stake, odd: 0, result: CastResultType.NOT_APPLICABLE }] };
        }
        this.showLogs({
          prefix,
          m:
            'Tricast has 1 pushed - Treat as forecast at CSF dividend ' +
            forecastDividend +
            ' - Betted ID: ' +
            betted_id +
            ' - ' +
            JSON.stringify(bets),
        });
        return {
          bets,
          selections,
          results: [{ stake, odd: Number(forecastDividend), result: CastResultType.FORECAST }],
        };
      } else {
        // Remaining 2 don't match 1st & 2nd → loss
        this.showLogs({
          prefix,
          m: 'Tricast has 1 pushed - Treat as forecast - Betted ID: ' + betted_id + ' - ' + JSON.stringify(bets),
        });
        return { bets, selections, results: [{ stake, odd: 0, result: CastResultType.MISSED }] };
      }
    }

    // All 3 runners but didn't match the exact finishing order → loss
    return { bets, selections, results: [{ stake, odd: 0, result: CastResultType.MISSED }] };
  }

  /**
   * Tricast Combination
   *
   * Player picks 4-6 runners. All possible ordered 3-permutation combinations are generated.
   * E.g. 4 runners → 24 combos (4 * 3 * 2). Max 6 runners → 120 combos.
   *
   * Each combination is independently checked against the actual 1st, 2nd, 3rd finishers.
   *
   * Non-runner rules applied per combination (same progressive degradation as tricast single):
   *   - 3 NR in combo → VOID
   *   - 2 NR in combo → SINGLE if remaining is winner
   *   - 1 NR in combo → FORECAST if the survivors match 1st & 2nd in the line's own order
   *   - 0 NR → must match all 3 positions for HIT
   */
  calculateTricastCombination({
    betted_id,
    bets,
    selections,
    dividend,
    forecastDividend,
    stake,
    prefix,
    manualWinningCombos,
  }: CastCalcParams): CastCalcOutput {
    // If any selection status is still unknown, keep the bet open
    if (bets.some((r) => this.isUnknownStatus(r.status))) {
      this.showLogs({
        prefix,
        m: 'Non Available Selections Status - Betted ID: ' + betted_id + ' - ' + JSON.stringify(bets),
      });
      return {
        bets,
        selections,
        results: [{ stake, odd: 0, result: CastResultType.NOT_APPLICABLE }],
      };
    }

    // ── All runners present: dead-heat-aware per-combination payout ──
    // Each ordered 3-permutation of the punter's selections that is a winning ordering
    // pays its own per-combination dividend in full (no 1/N — see deadHeatModel).
    // Non-runner cases use the legacy path below.
    if (!bets.some((r) => r.status === RaceSelectionStatus.NON_RUNNER)) {
      const { winningPerms } = this.deadHeatModel(selections, 3);
      const results = this.permutationsOf(
        bets.map((b) => b.selection_id),
        3,
      ).map((o) =>
        winningPerms.some((p) => this.areIdentical(p, o))
          ? { stake, odd: this.permDividend(o, manualWinningCombos, dividend), result: CastResultType.HIT }
          : { stake, odd: 0, result: CastResultType.MISSED },
      );
      this.showLogs({ prefix, m: 'Tricast Combination HIT (dead-heat aware) - Betted ID: ' + betted_id });
      return { bets, selections, results };
    }

    // Generate all 3-permutation combinations and evaluate each
    const combinations = this.generateTricastResults(bets, selections);

    this.showLogs({
      prefix,
      m: 'Tricast Combination - Betted ID: ' + betted_id + ' - Generated Combinations: ' + JSON.stringify(combinations),
    });

    // Map each generated combination to a payout result
    const returns: CastLineResult[] = combinations.map((r) => {
      if (r.outcome === CastResultType.HIT) {
        // Combination matches 1st, 2nd, 3rd exactly → pay the tricast tote dividend
        return {
          stake,
          odd: dividend ?? 0,
          result: CastResultType.HIT,
        };
      } else if (r.outcome === CastResultType.SINGLE) {
        // 2 of 3 selections were NR, remaining one is the winner → pay at winner's SP odd
        return {
          stake,
          odd: bets.find((b) => b.selection_id === r.selection_id)!.odd ?? 0,
          selection_id: r.selection_id,
          result: CastResultType.SINGLE,
        };
      } else if (r.outcome === CastResultType.FORECAST) {
        // 1 of 3 selections was NR and the survivors filled the top 2 in this line's own order
        // (see generateTricastResults) → forecast fallback, paid at the race's FORECAST dividend.
        // Previously `dividend / 2`, an invented approximation of a CSF price.
        // With no CSF dividend available, hold the line pending rather than guess a payout.
        if (!(Number(forecastDividend) > 0)) {
          return {
            stake,
            odd: 0,
            result: CastResultType.NOT_APPLICABLE,
          };
        }
        return {
          stake,
          odd: Number(forecastDividend),
          result: CastResultType.FORECAST,
        };
      } else if (r.outcome === CastResultType.VOID) {
        // All 3 selections in this combo are non-runners → refund stake
        return {
          stake,
          odd: 1,
          result: CastResultType.VOID,
        };
      } else if (r.outcome === CastResultType.MISSED) {
        // Combination didn't match → loss
        return {
          stake,
          odd: 0,
          result: CastResultType.MISSED,
        };
      } else {
        // Fallback for unexpected outcome values
        return {
          stake,
          odd: 0,
          result: CastResultType.NOT_APPLICABLE,
        };
      }
    });

    return {
      bets,
      selections,
      results: returns,
    };
  }

  /**
   * Swinger
   *
   * Player picks 2 runners to both finish in the top 3, in any order.
   * Unlike forecast/tricast, this doesn't require specific positions — just top 3 placement.
   *
   * Non-runner rules:
   *   - 2 non-runners → VOID (refund stake)
   *   - 1 non-runner + remaining is winner → SINGLE (pay at winner's SP odd)
   *   - 1 non-runner + remaining is not winner → MISSED
   */
  calculateSwinger({ betted_id, bets, selections, dividend, stake, prefix }: CastCalcParams): CastCalcOutput {
    // First check: are both selections in the top 3 finishers?
    if (
      this.isTopPositions(
        bets.map((r) => r.selection_id),
        selections.map((r) => r.selection_id),
        3,
      )
    ) {
      return { bets, selections, results: [{ stake, odd: dividend ?? 0, result: CastResultType.HIT }] };
    } else {
      // If any selection status is unknown, keep open
      if (bets.some((r) => this.isUnknownStatus(r.status))) {
        this.showLogs({
          prefix,
          m: 'Non Available Selections Status - Betted ID: ' + betted_id + ' - ' + JSON.stringify(bets),
        });
        return { bets, selections, results: [{ stake, odd: 0, result: CastResultType.NOT_APPLICABLE }] };
      }

      const noVoidedSelections = bets.filter((r) => r.status === RaceSelectionStatus.NON_RUNNER).length;

      // Both selections are non-runners → void, refund stake
      if (noVoidedSelections == 2) {
        this.showLogs({
          prefix,
          m: 'Swinger has been pushed - Betted ID: ' + betted_id + ' - ' + JSON.stringify(bets),
        });
        return { bets, selections, results: [{ stake, odd: 1, result: CastResultType.VOID }] };
        // 1 non-runner → check if the remaining selection won the race
      } else if (noVoidedSelections == 1) {
        const foundResultedSelection = bets.find((r) => r.status === RaceSelectionStatus.WINNER);
        if (foundResultedSelection) {
          // Remaining selection is a winner → single fallback at their SP odd
          this.showLogs({
            prefix,
            m: 'Swinger has 1 pushed - Treat as single - Betted ID: ' + betted_id + ' - ' + JSON.stringify(bets),
          });
          return {
            bets,
            selections,
            results: [{ stake, odd: foundResultedSelection.odd ?? 0, result: CastResultType.SINGLE }],
          };
        } else {
          // Remaining selection didn't win → loss
          this.showLogs({
            prefix,
            m: 'Swinger has 1 pushed - Treat as missed - Betted ID: ' + betted_id + ' - ' + JSON.stringify(bets),
          });
          return { bets, selections, results: [{ stake, odd: 0, result: CastResultType.MISSED }] };
        }
        // Both are runners but not both in top 3 → loss
      } else {
        this.showLogs({
          prefix,
          m: 'Swinger has 2 pushed - Treat as missed - Betted ID: ' + betted_id + ' - ' + JSON.stringify(bets),
        });
        return { bets, selections, results: [{ stake, odd: 0, result: CastResultType.MISSED }] };
      }
    }
  }

  // ─── COMPARISON HELPERS ────────────────────────────────────────────

  /**
   * Builds the dead-heat slot model for a forecast/tricast from the actual finishing
   * `selections` ([{selection_id, position}]). Returns:
   *   - winningPerms: every valid winning ordering of length K (2 forecast, 3 tricast),
   *     expanding dead-heats (runners sharing a finishing position are interchangeable).
   *
   * NO 1/N reduction is applied to cast payouts. On a dead heat the tote declares a
   * SEPARATE dividend for each winning combination and the reduction is already priced
   * into those dividends — dividing again halves a correctly-settled bet (metabetting
   * bet #258311 / multi 60593: paid 507.65 instead of 1,009.45). Confirmed by trading,
   * 2026-07-30. This differs from singles/EW/multiples, where we DO apply 1/N because
   * those pay a fixed price that carries no dead-heat adjustment.
   *
   * Examples (K=2): A=1,B=2 (clean) -> { winningPerms:[[A,B]] }
   *                 A=1,B=1         -> { winningPerms:[[A,B],[B,A]] }
   *                 A=1,B=1,C=1     -> { 6 ordered pairs }
   *                 A=1,B=2,C=2     -> { winningPerms:[[A,B],[A,C]] }
   */
  deadHeatModel(selections: RacePosition[], K: number): { winningPerms: CastSelectionId[][] } {
    const byPos = new Map<number, CastSelectionId[]>();
    for (const s of selections) {
      const p = Number(s.position);
      if (!byPos.has(p)) byPos.set(p, []);
      byPos.get(p)!.push(s.selection_id);
    }
    const positions = [...byPos.keys()].sort((a, b) => a - b);

    let perms: CastSelectionId[][] = [[]];
    let remaining = K;
    for (const p of positions) {
      if (remaining <= 0) break;
      const group = byPos.get(p)!;
      const take = Math.min(group.length, remaining);
      const groupPerms = this.permutationsOf(group, take); // ordered arrangements of `take` of the group
      // Equivalent to perms.flatMap((pre) => groupPerms.map((gp) => pre.concat(gp))), written
      // as a loop because the package targets an ES lib without Array.prototype.flatMap.
      const expanded: CastSelectionId[][] = [];
      for (const pre of perms) {
        for (const gp of groupPerms) expanded.push(pre.concat(gp));
      }
      perms = expanded;
      remaining -= take;
    }
    return { winningPerms: perms.filter((pp) => pp.length === K) };
  }

  /**
   * All ordered arrangements (permutations) of `r` items chosen from `arr`.
   * permutationsOf([A,B], 2) -> [[A,B],[B,A]] ; permutationsOf([A,B,C], 2) -> 6 pairs.
   */
  permutationsOf(arr: CastSelectionId[], r: number): CastSelectionId[][] {
    if (r === 0) return [[]];
    const out: CastSelectionId[][] = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = arr.slice(0, i).concat(arr.slice(i + 1));
      for (const sub of this.permutationsOf(rest, r - 1)) out.push([arr[i]].concat(sub));
    }
    return out;
  }

  /**
   * Dividend for a single winning permutation: the trader-declared per-combination
   * dividend (event_cast_dividends, via manualWinningCombos) when present and > 0,
   * else the single fallback dividend.
   */
  permDividend(
    perm: CastSelectionId[],
    manualWinningCombos: ManualWinningCombos | null | undefined,
    singleDividend: number | string | undefined,
  ): number {
    if (manualWinningCombos) {
      // Stringify each id before joining: the Map keys are DB strings
      // (event_cast_dividends.combination) so a numeric perm id must be coerced to match.
      const key = perm.map(String).join('_');
      if (manualWinningCombos.has(key)) {
        const d = Number(manualWinningCombos.get(key));
        if (Number.isFinite(d) && d > 0) return d;
      }
    }
    return Number(singleDividend);
  }

  /**
   * Resolves a forecast/tricast HIT for the all-runners case. Returns the payout odd,
   * or null when the bet loses.
   *
   * Win gate: the punter's ACTUAL ordering must be a valid winning ordering — i.e. it
   * must appear in winningPerms (which already enumerates every dead-heat-interchangeable
   * ordering). This is what makes a wrong-order forecast lose when a higher place is
   * clear: e.g. on a dead-heat for 2nd (A clear 1st, B&C tie 2nd) A→B wins but B→A loses,
   * because A genuinely beat B for 1st. Only when both picks tie for the SAME place
   * (dead-heat for 1st) are both orderings winning perms — so either order pays.
   *
   * Payout: a straight forecast/tricast is ONE line — the punter bought exactly one
   * ordering — so it pays that ordering's own dividend and nothing else.
   *
   * Ids are stringified for the dividend lookup only: bet ids arrive as strings
   * (user_bets_single.bet_id) while feed positions are numbers (bet_places.selection_id).
   * The win gate uses loose == (areIdentical) so a numeric/string mismatch still grades
   * correctly (incident: bet #154733 / multi 40451).
   */
  straightCastHitOdd(
    bets: CastBet[],
    selections: RacePosition[],
    K: number,
    dividend: number | string | undefined,
    manualWinningCombos?: ManualWinningCombos | null,
  ): number | null {
    const { winningPerms } = this.deadHeatModel(selections, K);
    const betIds = bets.map((b) => b.selection_id);
    // Win gate: the punter's exact order must itself be a winning ordering.
    const won = winningPerms.find((p) => this.areIdentical(betIds, p));
    if (!won) return null;
    // Pay the punter's own ordering. Key the dividend lookup off the winning permutation
    // (feed ids) rather than the bet ids, so the id types always match the combos map.
    return this.permDividend(won, manualWinningCombos, dividend);
  }

  /**
   * Checks if two arrays have identical elements in the same order.
   * Used for forecast/tricast where finishing ORDER matters.
   * E.g. areIdentical([A, B], [A, B]) → true, areIdentical([A, B], [B, A]) → false
   *
   * NOTE: Uses loose equality (==) which allows string/number coercion ("123" == 123 → true)
   */
  areIdentical(array1: CastSelectionId[], array2: CastSelectionId[]): boolean {
    if (array1.length !== array2.length) {
      return false;
    }

    // eslint-disable-next-line eqeqeq
    return array1.every((value, index) => value == array2[index]);
  }

  /**
   * Checks if two arrays contain the same items regardless of order.
   * Used where order doesn't matter.
   * E.g. sameItems([A, B], [B, A]) → true
   *
   * NOTE: .sort() mutates the input arrays — safe when called with .map() results but fragile
   */
  sameItems(array1: CastSelectionId[], array2: CastSelectionId[]): boolean {
    return this.areIdentical(array1.sort(), array2.sort());
  }

  /**
   * Same as sameItems but non-mutating, and string-coerced before comparing.
   *
   * Both matter here: the callers pass arrays that are reused afterwards (so an in-place .sort()
   * would corrupt them), and the two sides come from different id spaces — bet ids arrive as
   * strings (user_bets_single.bet_id) while the feed's finishing-position ids are numbers
   * (bet_places.selection_id). Coercing avoids the strict-equality mismatch that has already
   * caused a winning cast to pay £0 (see straightCastHitOdd / isTopPositions).
   *
   * E.g. sameItemsUnordered(["7", 3], [3, "7"]) → true
   */
  sameItemsUnordered(array1: CastSelectionId[], array2: CastSelectionId[]): boolean {
    if (array1.length !== array2.length) return false;
    const a = array1.map(String).sort();
    const b = array2.map(String).sort();
    return a.every((v, i) => v === b[i]);
  }

  /**
   * Checks if all items in array1 appear within the top N items of array2.
   * Used for swinger bets where selections must finish in top 3.
   *
   * @param array1 - Player's selection IDs
   * @param array2 - Actual finishing order selection IDs (ordered by position)
   * @param positions - Number of top positions to check (3 for swinger)
   */
  isTopPositions(array1: CastSelectionId[], array2: CastSelectionId[], positions: number): boolean {
    // Get the top N finishers from the actual results.
    // Coerce to strings: the bet ids are strings (user_bets_single.bet_id) but the SIS feed's
    // finishing-position ids are numbers (bet_places.selection_id), and Array.includes uses
    // strict ===. Without this a SIS swinger winner would never match the top-N and pay £0,
    // the same id-type mismatch that affected forecast/tricast in straightCastHitOdd.
    const topN = array2.slice(0, positions).map(String);

    // Check if ALL of the player's selections are within the top N
    return array1.every((value) => topN.includes(String(value)));
  }

  /**
   * Checks if any item in array1 appears in array2.
   * Currently unused but available for partial match logic.
   */
  hasCombination(array1: CastSelectionId[], array2: CastSelectionId[]): boolean {
    return array1.some((item) => array2.includes(item));
  }

  // ─── COMBINATION GENERATORS ────────────────────────────────────────

  /**
   * Generates all 2-permutation combinations for forecast combination bets.
   *
   * For each ordered pair (i, j) where i ≠ j:
   *   - If both are NR/unavailable → VOID
   *   - If one is NR/unavailable and the other is a WINNER → SINGLE (tracks which selection won)
   *   - If one is NR/unavailable and the other is not a winner → MISSED
   *   - If both are runners and match the actual 1st & 2nd in exact order → HIT
   *   - Otherwise → MISSED
   */
  generateForecastResults(bets: CastBet[], selections: RacePosition[]): GeneratedCastLine[] {
    const results: GeneratedCastLine[] = [];

    // Cap at 6 selections to limit combination explosion
    const maxSelections = bets.slice(0, 6);

    for (let i = 0; i < maxSelections.length; i++) {
      for (let j = 0; j < maxSelections.length; j++) {
        if (i === j) continue; // Skip same selection paired with itself

        const first = maxSelections[i];
        const second = maxSelections[j];
        const combination = [first.selection_id, second.selection_id];
        let selection_id: CastSelectionId = 0; // Tracks the winning selection for SINGLE outcomes

        let outcome: CastResultType = CastResultType.NOT_APPLICABLE;

        const voidedStatuses: string[] = [RaceSelectionStatus.NON_RUNNER, RaceSelectionStatus.NON_AVAILABLE];

        if (voidedStatuses.includes(String(first.status)) && voidedStatuses.includes(String(second.status))) {
          // Both selections in this combo are non-runners → void this combination
          outcome = CastResultType.VOID;
        } else if (voidedStatuses.includes(String(first.status)) || voidedStatuses.includes(String(second.status))) {
          // One selection is NR — check if the other one is the race winner
          if (first.status === RaceSelectionStatus.WINNER || second.status === RaceSelectionStatus.WINNER) {
            selection_id = first.status === RaceSelectionStatus.WINNER ? first.selection_id : second.selection_id;
            outcome = CastResultType.SINGLE; // Fall back to single bet at winner's SP
          } else {
            // One NR, but the other is a runner who didn't win → loss for this combo
            outcome = CastResultType.MISSED;
          }
        } else if (
          this.areIdentical(
            combination,
            selections.map((r) => r.selection_id),
          )
        ) {
          // Both are runners and the combination matches 1st & 2nd in exact order → HIT
          outcome = CastResultType.HIT;
        } else {
          // Both are runners but wrong order or wrong selections → loss
          outcome = CastResultType.MISSED;
        }

        results.push({
          combination,
          outcome,
          selection_id,
        });
      }
    }

    return results;
  }

  /**
   * Generates all 3-permutation combinations for tricast combination bets.
   *
   * For each ordered triple (i, j, k) where all indices are different:
   *   - 3 NR/unavailable → VOID
   *   - 2 NR/unavailable + remaining is WINNER → SINGLE
   *   - 2 NR/unavailable + remaining is not winner → MISSED
   *   - 1 NR/unavailable + the survivors match 1st & 2nd in this line's own order → FORECAST fallback
   *   - 1 NR/unavailable + survivors don't match → MISSED
   *   - 0 NR and all 3 match 1st, 2nd, 3rd in order → HIT
   *   - Otherwise → MISSED
   */
  generateTricastResults(bets: CastBet[], selections: RacePosition[]): GeneratedCastLine[] {
    const results: GeneratedCastLine[] = [];

    // Cap at 6 selections to limit combination explosion
    const maxSelections = bets.slice(0, 6);

    // Triple nested loop generates all ordered 3-permutations
    for (let i = 0; i < maxSelections.length; i++) {
      for (let j = 0; j < maxSelections.length; j++) {
        for (let k = 0; k < maxSelections.length; k++) {
          if (i === j || i === k || j === k) continue; // Skip any combo with duplicate indices

          const first = maxSelections[i];
          const second = maxSelections[j];
          const third = maxSelections[k];
          const combination = [first.selection_id, second.selection_id, third.selection_id];
          let selection_id: CastSelectionId = 0;

          let outcome: CastResultType = CastResultType.NOT_APPLICABLE;

          const voidedStatuses: string[] = [RaceSelectionStatus.NON_RUNNER, RaceSelectionStatus.NON_AVAILABLE];
          const voidedCount = [first, second, third].filter((bet) =>
            voidedStatuses.includes(String(bet.status)),
          ).length;

          if (voidedCount === 3) {
            // All 3 selections in this combo are NR → void this combination
            outcome = CastResultType.VOID;
          } else if (voidedCount === 2) {
            // 2 of 3 are NR → treat remaining as a single bet
            const remainingBet = [first, second, third].find((bet) => !voidedStatuses.includes(String(bet.status)));
            if (remainingBet?.status === RaceSelectionStatus.WINNER) {
              selection_id = remainingBet.selection_id;
              outcome = CastResultType.SINGLE; // Pay at winner's SP odd
            } else {
              outcome = CastResultType.MISSED; // Remaining runner didn't win
            }
          } else if (voidedCount === 1) {
            // 1 of 3 is NR → this line degrades to a forecast on the two survivors, which keep
            // the order they hold in THIS line and must fill 1st and 2nd in that exact order.
            // Order-sensitive on purpose: a combination tricast already generates the mirrored
            // line (…B…A… as well as …A…B…), so accepting either order here would pay the
            // punter twice for cover they bought once.
            const remainingBets = [first, second, third].filter((bet) => !voidedStatuses.includes(String(bet.status)));
            if (
              this.areIdentical(
                remainingBets.map((bet) => bet.selection_id),
                selections.slice(0, 2).map((sel) => sel.selection_id), // 1st & 2nd finishers
              )
            ) {
              outcome = CastResultType.FORECAST; // Survivors filled 1st & 2nd in this line's order
            } else {
              outcome = CastResultType.MISSED; // Survivors didn't fill the top 2 in this order
            }
          } else if (
            this.areIdentical(
              combination,
              selections.map((r) => r.selection_id),
            )
          ) {
            // All 3 runners match 1st, 2nd, 3rd in exact order → HIT
            outcome = CastResultType.HIT;
          } else {
            // All 3 are runners but wrong positions → loss
            outcome = CastResultType.MISSED;
          }

          results.push({
            combination,
            outcome,
            selection_id,
          });
        }
      }
    }

    return results;
  }
}

/** Ready-made instance with no logging, for callers that don't need the worker's log output. */
export const castCalculator = new CastCalculator();

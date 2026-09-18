/**
 * Free-bet "Stake Not Returned" (SNR) accounting.
 *
 * Shared by the auto-settle worker (swiftyPredictionsELBAPI) and the manual-settle CMS
 * (SwiftyPredictionsCMSEB). No DB, no logging, no side-effects.
 */

/**
 * How much of a free bet's stake to withhold from the gross return.
 *
 * A free bet does not return its stake, so the deduction is the free stake of the lines that
 * actually returned money. A single is one line, so the whole free stake is withheld. A cast is
 * one bet row but N lines — a reverse forecast is 2 orderings, a combination every ordered
 * permutation — and normally only some lines return, so deducting the whole free stake once
 * strips the losing lines' stake a second time and under-pays the punter (worker card 5677).
 *
 * Pair with `CastCalculator.castLineCounts`, which reports `totalLines` and how many of them
 * returned money. `winningLineCount == null` means "nothing to count from", and the whole free
 * stake is withheld — the conservative direction, which can never over-credit.
 *
 * The result is capped at the free stake, so the deduction can only ever shrink.
 */
export function freeBetSnrDeduction({
  free_bet_amount,
  totalLines,
  winningLineCount,
}: {
  free_bet_amount: number | string | null | undefined;
  totalLines: number | string | null | undefined;
  winningLineCount: number | string | null | undefined;
}): number {
  const free = Number(free_bet_amount) || 0;
  if (free <= 0) return 0;
  const lines = Number(totalLines) || 0;
  if (lines <= 0 || winningLineCount == null) return free;
  const winners = Math.max(0, Number(winningLineCount) || 0);
  const freeStakePerLine = free / lines;
  return Math.min(free, freeStakePerLine * winners);
}

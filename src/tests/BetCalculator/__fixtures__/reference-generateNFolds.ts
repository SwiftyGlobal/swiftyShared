/** FROZEN reference: verbatim copy of GamingBackend nFoldCalculator.generateNFolds (2026-06-19).
 *  Do not "improve" — it exists to prove priceCombinations reproduces production. */
export interface RefNFoldBet {
  odd: number; ew_terms?: string; starting_price?: boolean;
  participant_id?: string; competition_id?: string; event_id?: string;
}
export interface RefNFoldResult { return: number; placeReturn: number; noOfCombinations: number }

export function referenceGenerateNFolds(
  bets: RefNFoldBet[], n: number, is_each_way = false,
  exclude_same_participant = false, exclude_same_event = false,
): RefNFoldResult {
  const arrayCombinations: any[][] = [];
  function helper(currentCombo: any[], start: number) {
    if (currentCombo.length === n) { arrayCombinations.push(currentCombo); return; }
    for (let i = start; i < bets.length; i++) {
      const bet = bets[i];
      const odd = bet.starting_price ? 0 : bet.odd;
      let place_odd = bet.starting_price ? 0 : 1;
      if (bet.ew_terms && is_each_way && !bet.starting_price) {
        const [numerator, denominator] = bet.ew_terms.split('/');
        place_odd = (bet.odd - 1) * (+numerator / +denominator) + 1;
      }
      helper(currentCombo.concat({ odd, place_odd, participant_id: bet.participant_id, competition_id: bet.competition_id, event_id: bet.event_id }), i + 1);
    }
  }
  helper([], 0);
  const filtered = arrayCombinations.filter((combination) => {
    if (exclude_same_participant) {
      const seen = new Set<string>();
      for (const el of combination) {
        if (!el.participant_id || String(el.participant_id) === '0' || !el.competition_id) continue;
        const key = `${el.competition_id}-${el.participant_id}`;
        if (seen.has(key)) return false; seen.add(key);
      }
    }
    if (exclude_same_event) {
      const seen = new Set<string>();
      for (const el of combination) {
        if (!el.event_id) continue;
        if (seen.has(el.event_id)) return false; seen.add(el.event_id);
      }
    }
    return true;
  });
  let sum = 0, place = 0;
  for (const els of filtered) {
    let m = 1, pm = 1;
    for (const { odd, place_odd } of els) { m *= odd; pm *= place_odd; }
    sum += m; if (is_each_way) place += pm;
  }
  return { return: +sum, placeReturn: +place, noOfCombinations: filtered.length };
}

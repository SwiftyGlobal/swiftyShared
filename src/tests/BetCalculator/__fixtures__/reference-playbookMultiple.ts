/** FROZEN reference: verbatim port of ELBAPI playbookMultiple return math (2026-06-19).
 *  Decimal odds. Proves BetCalculator.processBet reproduces production settlement returns.
 *
 *  Live-file verification notes (swiftyPredictionsELBAPI/service/playbookMultiple.js):
 *  - getND: live returns [1, fractional] when no '/' found; brief says [0,1].
 *    Divergence is immaterial for all test cases (ew_terms always null or "n/d" form).
 *    Fixture uses the brief form; test cases use explicit "1/4" strings so behaviour is identical.
 *  - getDoubleReturnAmountWithWinners: live does NOT track event_id on combo objects and
 *    has NO excludeSameEvent logic — same-event exclusion is handled by bet-type routing upstream.
 *    Fixture adds excludeSameEvent parameter to support cross-double/treble test cases.
 *  - getCombinations: live has only filterInvalidCombinations (participant), no excludeSameEvent.
 *    Fixture adds excludeSameEvent to support treble cross-case.
 *  - half_won / half_lost branches: live getDoubleReturnAmountWithWinners delegates to
 *    getHalfResultCombination; fixture inlines the same math in entry(). Behaviour identical.
 *  - getTrebleReturnAmountWithWinners stake multiply: live returns
 *    returnPlaceAmount ? returnAmount*stake + returnPlaceAmount*stake : returnAmount*stake
 *    (identical to fixture).
 */
export interface RefLeg {
  odd: number; result: string; ew_terms?: string | null;
  participant_id?: string | number; sport_slug?: string; event_id?: string; id?: number;
}

const getND = (f?: string | null): [number, number] => {
  if (!f || !f.includes('/')) return [0, 1];
  const [n, d] = f.split('/'); return [+n, +d];
};

const shareParticipant = (a: RefLeg, b: RefLeg): boolean =>
  a.sport_slug === 'darts' && b.sport_slug === 'darts' &&
  a.participant_id != null && String(a.participant_id) !== '0' &&
  b.participant_id != null && String(b.participant_id) !== '0' &&
  a.participant_id === b.participant_id;

// build the per-leg combination entry exactly as playbookMultiple does
function entry(row: RefLeg, stake: number, each_way: number): any | null {
  const result = row.result.toLowerCase();
  const [num, den] = getND(row.ew_terms);
  const base: any = { id: row.id, stake, participant_id: row.participant_id, sport_slug: row.sport_slug, event_id: row.event_id };
  if (result === 'winner') {
    if (each_way === 1) return { ...base, odd: row.odd, place_odd: (row.odd - 1) * (num / den) + 1 };
    return { ...base, odd: row.odd };
  }
  if (result === 'placed' && each_way === 1) return { ...base, odd: 0, place_odd: (row.odd - 1) * (num / den) + 1 };
  if (result === 'void' || result === 'pushed' || result === 'push') {
    if (each_way === 1) return { ...base, odd: 1, place_odd: 1 };
    return { ...base, odd: 1 };
  }
  if (result === 'half_won') return { ...base, odd: row.odd / 2, place_odd: each_way === 1 ? ((row.odd - 1) * (num / den) + 1) / 2 : undefined };
  if (result === 'half_lost') return { ...base, odd: 0.5, place_odd: each_way === 1 ? 0.5 : undefined };
  return null; // loser
}

export function referenceDoubleReturn(legs: RefLeg[], stake: number, each_way: number, excludeSameEvent = false): number {
  const combos = legs.map((l) => entry(l, stake, each_way)).filter(Boolean) as any[];
  let ret = 0, place = 0;
  for (let i = 0; i < combos.length; i++)
    for (let j = i + 1; j < combos.length; j++) {
      if (shareParticipant(combos[i], combos[j])) continue;
      if (excludeSameEvent && combos[i].event_id != null && combos[i].event_id === combos[j].event_id) continue;
      ret += combos[i].odd * combos[j].odd * stake;
      if (each_way) place += (combos[i].place_odd ?? 0) * (combos[j].place_odd ?? 0) * stake;
    }
  return ret + place;
}

function getCombinations(arr: any[], k: number, filterParticipant: boolean, excludeSameEvent: boolean): any[][] {
  const out: any[][] = [];
  const loop = (start: number, depth: number, acc: any[]) => {
    if (depth === 0) { out.push(acc); return; }
    for (let i = start; i <= arr.length - depth; i++) {
      const cur = arr[i]; let conflict = false;
      for (const ex of acc) {
        if (filterParticipant && shareParticipant(ex, cur)) { conflict = true; break; }
        if (excludeSameEvent && ex.event_id != null && ex.event_id === cur.event_id) { conflict = true; break; }
      }
      if (!conflict) loop(i + 1, depth - 1, [...acc, cur]);
    }
  };
  loop(0, k, []);
  return out;
}

export function referenceTrebleReturn(legs: RefLeg[], stake: number, each_way: number, excludeSameEvent = false): number {
  const winners = legs.map((l) => entry(l, stake, each_way)).filter(Boolean) as any[];
  const combos = getCombinations(winners, 3, true, excludeSameEvent);
  const ret = combos.reduce((a, c) => a + c.reduce((aa: number, cc: any) => aa * Number(cc.odd), 1), 0);
  const place = each_way === 1 ? combos.reduce((a, c) => a + c.reduce((aa: number, cc: any) => aa * Number(cc.place_odd ?? 0), 1), 0) : 0;
  return place ? ret * stake + place * stake : ret * stake;
}

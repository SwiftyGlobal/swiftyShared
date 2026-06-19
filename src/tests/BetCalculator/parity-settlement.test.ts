/**
 * Settlement parity: BetCalculator.processBet vs playbookMultiple reference math.
 *
 * Convention alignment:
 *   referenceDoubleReturn / referenceTrebleReturn return the GROSS total:
 *     Σ(odd_i * odd_j * stake) per combo, which INCLUDES stake return.
 *   BetCalculator.processBet returns:
 *     return_payout  = stake_returned + win_profit + place_profit  (gross total)
 *     return_stake   = stake portion (non-zero only when bet is not a pure loser)
 *   Therefore: return_payout === ref  (same gross total, to 2 dp).
 *
 * Known divergence — HALF_WON in multiples:
 *   playbookMultiple treats HALF_WON as odd/2 in combination math.
 *   BetCalculator.getSingleResultOdds has an empty HALF_WON branch → odds default to 0
 *   and getBetResultType falls through to LOSER.
 *   Result: processBet returns 0 for a HALF_WON leg in a double/treble; reference returns
 *   non-zero. This is a REAL divergence and is flagged with BLOCKED in the test title.
 */

import { BetCalculator } from '../../BetCalculator/bet-calculator.class';
import { BetSlipType } from '../../common/constants/betSlipType';
import { BetResultType } from '../../common/constants/betResultType';
import type { PlacedBetSelection } from '../../common/dto/PlacedBet';
import { referenceDoubleReturn, referenceTrebleReturn, RefLeg } from './__fixtures__/reference-playbookMultiple';

// Map reference result strings to BetResultType
const RES: Record<string, BetResultType> = {
  winner: BetResultType.WINNER,
  void: BetResultType.VOID,
  loser: BetResultType.LOSER,
  placed: BetResultType.PLACED,
  half_won: BetResultType.HALF_WON,
  half_lost: BetResultType.HALF_LOST,
};

/** Build a PlacedBetSelection from a RefLeg for processBet input. */
function toBet(l: RefLeg, i: number, stake: number, eachWay: boolean): PlacedBetSelection {
  return {
    bet_id: i,
    stake,
    result: RES[l.result] ?? BetResultType.LOSER,
    is_starting_price: false,
    sp_odd_fractional: '',
    odd_fractional: '',
    ew_terms: l.ew_terms ?? '',
    partial_win_percent: 0,
    rule_4: 0,
    is_each_way: eachWay,
    sp_odd_decimal: 0,
    odd_decimal: l.odd,
    event_id: l.event_id,
    sport_slug: l.sport_slug,
    participant_id: l.participant_id,
  };
}

describe('settlement parity: BetCalculator === playbookMultiple', () => {
  const bc = new BetCalculator();

  // ── 1. All-winner double @2, @3, stake=1 ──────────────────────────────────
  it('all-winner double @2,@3 stake=1 → gross return 6', () => {
    const legs: RefLeg[] = [{ odd: 2, result: 'winner' }, { odd: 3, result: 'winner' }];
    const stake = 1;
    const ref = referenceDoubleReturn(legs, stake, 0);
    // ref = 2*3*1 = 6
    expect(ref).toBeCloseTo(6, 2);

    const r = bc.processBet({
      stake,
      total_stake: stake,
      bets: legs.map((l, i) => toBet(l, i, stake, false)),
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    // return_payout = gross (stake + profit) — same convention as ref
    expect(r.return_payout).toBeCloseTo(ref, 2);
  });

  // ── 2. All-winner treble @2, @3, @4, stake=1 ────────────────────────────
  it('all-winner treble @2,@3,@4 stake=1 → gross return 24', () => {
    const legs: RefLeg[] = [
      { odd: 2, result: 'winner' },
      { odd: 3, result: 'winner' },
      { odd: 4, result: 'winner' },
    ];
    const stake = 1;
    const ref = referenceTrebleReturn(legs, stake, 0);
    // ref = 2*3*4*1 = 24
    expect(ref).toBeCloseTo(24, 2);

    const r = bc.processBet({
      stake,
      total_stake: stake,
      bets: legs.map((l, i) => toBet(l, i, stake, false)),
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(r.return_payout).toBeCloseTo(ref, 2);
  });

  // ── 3. One void double: VOID@2 + WINNER@3, stake=1 ───────────────────────
  // Reference: void entry has odd=1, so combo = 1*3*1 = 3 (stake returned through void leg)
  it('void+winner double @2void,@3winner stake=1 → gross return 3', () => {
    const legs: RefLeg[] = [{ odd: 2, result: 'void' }, { odd: 3, result: 'winner' }];
    const stake = 1;
    const ref = referenceDoubleReturn(legs, stake, 0);
    // ref = 1*3*1 = 3
    expect(ref).toBeCloseTo(3, 2);

    const r = bc.processBet({
      stake,
      total_stake: stake,
      bets: legs.map((l, i) => toBet(l, i, stake, false)),
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(r.return_payout).toBeCloseTo(ref, 2);
  });

  // ── 4. One loser double: LOSER@2 + WINNER@3, stake=1 ─────────────────────
  // Reference: loser entry is null (not added), so no valid combo → ref = 0
  it('loser+winner double @2loser,@3winner stake=1 → gross return 0', () => {
    const legs: RefLeg[] = [{ odd: 2, result: 'loser' }, { odd: 3, result: 'winner' }];
    const stake = 1;
    const ref = referenceDoubleReturn(legs, stake, 0);
    // ref = 0 (loser entry excluded)
    expect(ref).toBeCloseTo(0, 2);

    const r = bc.processBet({
      stake,
      total_stake: stake,
      bets: legs.map((l, i) => toBet(l, i, stake, false)),
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(r.return_payout).toBeCloseTo(ref, 2);
  });

  // ── 5. Each-way double: WINNER@4 + PLACED@3, ew=1/4, stake=1 ───────────
  // Reference: winner entry odd=4 place_odd=1.75; placed entry odd=0 place_odd=1.5
  //   ret = 4*0*1 = 0; place = 1.75*1.5*1 = 2.625 → ref = 2.625
  it('ew double winner@4+placed@3 ew=1/4 stake=1 → gross return 2.625', () => {
    const legs: RefLeg[] = [
      { odd: 4, result: 'winner', ew_terms: '1/4' },
      { odd: 3, result: 'placed', ew_terms: '1/4' },
    ];
    const stake = 1;
    const ref = referenceDoubleReturn(legs, stake, 1);
    expect(ref).toBeCloseTo(2.625, 2);

    const r = bc.processBet({
      stake,
      total_stake: stake,
      bets: legs.map((l, i) => toBet(l, i, stake, true)),
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });
    expect(r.return_payout).toBeCloseTo(ref, 2);
  });

  // ── 6. Each-way double: both WINNER@2 + WINNER@3, ew=1/4, stake=1 ────────
  // Reference: winner@2: odd=2 place_odd=1.25; winner@3: odd=3 place_odd=1.5
  //   ret = 2*3*1 = 6; place = 1.25*1.5*1 = 1.875 → ref = 7.875
  it('ew double both-winner @2+@3 ew=1/4 stake=1 → gross return 7.875', () => {
    const legs: RefLeg[] = [
      { odd: 2, result: 'winner', ew_terms: '1/4' },
      { odd: 3, result: 'winner', ew_terms: '1/4' },
    ];
    const stake = 1;
    const ref = referenceDoubleReturn(legs, stake, 1);
    expect(ref).toBeCloseTo(7.875, 2);

    const r = bc.processBet({
      stake,
      total_stake: stake,
      bets: legs.map((l, i) => toBet(l, i, stake, true)),
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: true,
    });
    expect(r.return_payout).toBeCloseTo(ref, 2);
  });

  // ── 7. HALF_WON double ──────────────────────────────────────────────────
  // Reference: HALF_WON@4 → effective odd=4/2=2; WINNER@3 → odd=3. ref = 2*3*1 = 6.
  it('half_won+winner double @4half_won,@3winner stake=1 → gross return 6', () => {
    const legs: RefLeg[] = [{ odd: 4, result: 'half_won' }, { odd: 3, result: 'winner' }];
    const stake = 1;
    const ref = referenceDoubleReturn(legs, stake, 0);
    // ref: half_won odd = 4/2 = 2. combo = 2*3*1 = 6
    expect(ref).toBeCloseTo(6, 2);

    const r = bc.processBet({
      stake,
      total_stake: stake,
      bets: legs.map((l, i) => toBet(l, i, stake, false)),
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(r.return_payout).toBeCloseTo(ref, 2);
  });

  // ── 7b. HALF_LOST double ─────────────────────────────────────────────────
  // Reference: HALF_LOST@4 → effective odd=0.5; WINNER@3 → odd=3. ref = 0.5*3*1 = 1.5.
  it('half_lost+winner double @4half_lost,@3winner stake=1 → gross return 1.5', () => {
    const legs: RefLeg[] = [{ odd: 4, result: 'half_lost' }, { odd: 3, result: 'winner' }];
    const stake = 1;
    const ref = referenceDoubleReturn(legs, stake, 0);
    // ref: half_lost effective odd = 0.5. combo = 0.5*3*1 = 1.5
    expect(ref).toBeCloseTo(1.5, 2);

    const r = bc.processBet({
      stake,
      total_stake: stake,
      bets: legs.map((l, i) => toBet(l, i, stake, false)),
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(r.return_payout).toBeCloseTo(ref, 2);
  });

  // ── 7c. HALF_WON@2.0 (evens) in a double ────────────────────────────────
  // Reference: HALF_WON@2 → effective odd = 2/2 = 1.0; WINNER@3 → odd = 3.
  // ref = 1.0 * 3 * 1 = 3.00
  it('half_won@evens+winner double @2half_won,@3winner stake=1 → gross return 3.00', () => {
    const legs: RefLeg[] = [{ odd: 2, result: 'half_won' }, { odd: 3, result: 'winner' }];
    const stake = 1;
    const ref = referenceDoubleReturn(legs, stake, 0);
    // ref: half_won@2 effective odd = 2/2 = 1.0. combo = 1.0*3*1 = 3.0
    expect(ref).toBeCloseTo(3, 2);

    const r = bc.processBet({
      stake,
      total_stake: stake,
      bets: legs.map((l, i) => toBet(l, i, stake, false)),
      bet_type: BetSlipType.DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(r.return_payout).toBeCloseTo(ref, 2);
  });

  // ── 7d. HALF_WON@2.0 (evens) in a treble ────────────────────────────────
  // Reference: HALF_WON@2 → effective odd = 2/2 = 1.0; WINNER@3 → odd = 3; WINNER@4 → odd = 4.
  // ref = 1.0 * 3 * 4 * 1 = 12.00
  it('half_won@evens+winner+winner treble @2half_won,@3winner,@4winner stake=1 → gross return 12.00', () => {
    const legs: RefLeg[] = [
      { odd: 2, result: 'half_won' },
      { odd: 3, result: 'winner' },
      { odd: 4, result: 'winner' },
    ];
    const stake = 1;
    const ref = referenceTrebleReturn(legs, stake, 0);
    // ref: half_won@2 effective odd = 1.0. combo = 1.0*3*4*1 = 12.0
    expect(ref).toBeCloseTo(12, 2);

    const r = bc.processBet({
      stake,
      total_stake: stake,
      bets: legs.map((l, i) => toBet(l, i, stake, false)),
      bet_type: BetSlipType.TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });

    expect(r.return_payout).toBeCloseTo(ref, 2);
  });

  // ── 8. Cross (same-event) double excluded ────────────────────────────────
  // 3 legs: A@2 event=E1, B@3 event=E1, C@4 event=E2.
  // With excludeSameEvent: only combos (A,C)=8 and (B,C)=12 are valid. ref = (2*4 + 3*4)*1 = 20
  // processBet with CROSS_DOUBLE excludes same-event pairs via sameEventIncompatible.
  it('cross double 3 legs two same-event: only cross-event combos counted', () => {
    const legs: RefLeg[] = [
      { odd: 2, result: 'winner', event_id: 'E1' },
      { odd: 3, result: 'winner', event_id: 'E1' },
      { odd: 4, result: 'winner', event_id: 'E2' },
    ];
    const stake = 1;
    const ref = referenceDoubleReturn(legs, stake, 0, true);
    // combos: (E1_A, E2) = 2*4 = 8; (E1_B, E2) = 3*4 = 12; ref = 20
    expect(ref).toBeCloseTo(20, 2);

    const r = bc.processBet({
      stake,
      total_stake: stake * 2, // 2 valid combos
      bets: legs.map((l, i) => toBet(l, i, stake, false)),
      bet_type: BetSlipType.CROSS_DOUBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(r.return_payout).toBeCloseTo(ref, 2);
  });

  // ── 9. Cross (same-event) treble excluded ────────────────────────────────
  // 4 legs: A@2 event=E1, B@3 event=E2, C@4 event=E3, D@5 event=E3.
  // Valid treble combos (no same-event): ABC=24, ABD=30, ACD excluded(E3+E3), BCD excluded → valid: ABC, ABD
  // ref = (2*3*4 + 2*3*5)*1 = 24+30 = 54
  it('cross treble 4 legs two same-event: only cross-event treble combos counted', () => {
    const legs: RefLeg[] = [
      { odd: 2, result: 'winner', event_id: 'E1' },
      { odd: 3, result: 'winner', event_id: 'E2' },
      { odd: 4, result: 'winner', event_id: 'E3' },
      { odd: 5, result: 'winner', event_id: 'E3' },
    ];
    const stake = 1;
    const ref = referenceTrebleReturn(legs, stake, 0, true);
    // combos: (E1,E2,E3_C)=2*3*4=24; (E1,E2,E3_D)=2*3*5=30; (E1,E3_C,E3_D)=skip; (E2,E3_C,E3_D)=skip
    expect(ref).toBeCloseTo(54, 2);

    const r = bc.processBet({
      stake,
      total_stake: stake * 2, // 2 valid treble combos
      bets: legs.map((l, i) => toBet(l, i, stake, false)),
      bet_type: BetSlipType.CROSS_TREBLE,
      free_bet_amount: 0,
      bog_applicable: false,
      bog_max_payout: 0,
      max_payout: 0,
      each_way: false,
    });
    expect(r.return_payout).toBeCloseTo(ref, 2);
  });
});

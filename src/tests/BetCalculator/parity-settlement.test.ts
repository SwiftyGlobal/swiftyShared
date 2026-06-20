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
 *
 * Deep settlement parity (task A1):
 *   referenceDeepSettle reproduces ELBAPI's full per-leg resolution (R4, dead-heat, BOG, EW)
 *   and returns { return (R4 base), bog_amount_won }.
 *   BetCalculator.return_payout = ref.return + ref.bog_amount_won (total, BOG included).
 *   BetCalculator.bog_amount_won = ref.bog_amount_won.
 *
 * Dead-heat equivalence (empirical finding):
 *   ELBAPI: adjustedOdd = odd * (partialPercent / 100) at the leg level (odds multiplied).
 *   BetCalculator: win_stake = stake * (1 - partial_win_percent / 100) (stake multiplied).
 *   For a single dead-heat leg in a combination, both yield:
 *     gross = original_odd * (p/100) * other_odds * stake  (commutative, equivalent).
 *   They are algebraically identical for single-leg dead-heat; tested and PASS confirmed.
 */

import { BetCalculator } from '../../BetCalculator/bet-calculator.class';
import { BetSlipType } from '../../common/constants/betSlipType';
import { BetResultType } from '../../common/constants/betResultType';
import type { PlacedBetSelection } from '../../common/dto/PlacedBet';
import { referenceDoubleReturn, referenceTrebleReturn, RefLeg } from './__fixtures__/reference-playbookMultiple';
import { referenceDeepSettle, DeepLeg } from './__fixtures__/reference-deep-settlement';

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

});

// ─────────────────────────────────────────────────────────────────────────────
// Deep settlement parity (Task A1)
// ─────────────────────────────────────────────────────────────────────────────
//
// For non-BOG cases: BetCalculator.return_payout === ref.return
// For BOG cases:     BetCalculator.return_payout === ref.return + ref.bog_amount_won
//                    BetCalculator.bog_amount_won === ref.bog_amount_won
//
// Helpers:

/** Build a PlacedBetSelection from a DeepLeg for processBet input. */
function deepToBet(l: DeepLeg, i: number, stake: number, eachWay: boolean): PlacedBetSelection {
  // EMPIRICALLY DETERMINED dead-heat transform (task-A1 F2):
  //   ELBAPI partialPercent = 100 / numberOfTyingRunners  (e.g. 50 for 2-way, 33.33 for 3-way, 25 for 4-way).
  //   BetCalculator reduces stake: win_stake *= (1 - partial_win_percent / 100).
  //   To reproduce ELBAPI's odd-level reduction (odd * partialPercent/100) via stake-level:
  //     we need: stake * (1 - pwp/100) = stake * (partialPercent/100)
  //     ∴ pwp = 100 - partialPercent
  //   2-way: pwp = 100 - 50 = 50  (coincidentally equal to partialPercent)
  //   3-way: pwp = 100 - 33.33 = 66.67
  //   4-way: pwp = 100 - 25    = 75
  //   0 (no dead-heat): pwp = 0  (special-cased: 100 - 0 would be wrong)
  const pp = l.partial_percent ?? 0;
  const partial_win_percent = pp > 0 ? (100 - pp) : 0;

  return {
    bet_id: i,
    stake,
    result: l.result === 'winner' ? BetResultType.WINNER
          : l.result === 'placed' ? (eachWay ? BetResultType.PLACED : BetResultType.LOSER)
          : l.result === 'void' || l.result === 'push' || l.result === 'pushed' ? BetResultType.VOID
          : BetResultType.LOSER,
    is_starting_price: false,
    sp_odd_fractional: '',
    odd_fractional: '',
    ew_terms: l.ew_terms ?? '',
    partial_win_percent,
    rule_4: l.rule_4 ?? 0,
    is_each_way: eachWay,
    // sp_odd_decimal: set to odd_decimal for non-BOG legs so BOG odds comparison yields no improvement.
    // For BOG legs with better SP, set to the actual SP value.
    sp_odd_decimal: l.sp_odd_decimal ?? l.odd_decimal,
    odd_decimal: l.odd_decimal,
  };
}

/** Helper: create a bet with processBet for deep settlement parity tests. */
function runProcessBet(
  bc: BetCalculator,
  legs: DeepLeg[],
  betType: BetSlipType,
  stake: number,
  eachWay: boolean,
  bogApplicable: boolean,
): ReturnType<BetCalculator['processBet']> {
  return bc.processBet({
    stake,
    total_stake: stake,
    bets: legs.map((l, i) => deepToBet(l, i, stake, eachWay)),
    bet_type: betType,
    free_bet_amount: 0,
    bog_applicable: bogApplicable,
    bog_max_payout: 0,
    max_payout: 0,
    each_way: eachWay,
  });
}

describe('deep settlement parity', () => {
  const bc = new BetCalculator();

  // ── Case 1: R4 leg ─────────────────────────────────────────────────────────
  // winner @5.0, rule_4=25% + winner @3.0.  R4 reduces 5.0 → 4.0.
  // ELBAPI R4: oddAfterRule4(5, 25) = 1 + 4*0.75 = 4.0
  // BetCalculator: rule_4 is applied inside retrieveSelectionOdd (same formula).
  describe('R4 leg (winner@5 r4=25% + winner@3)', () => {
    const legs2: DeepLeg[] = [
      { odd_decimal: 5.0, rule_4: 25, result: 'winner' },
      { odd_decimal: 3.0, result: 'winner' },
    ];
    const legs3: DeepLeg[] = [
      { odd_decimal: 5.0, rule_4: 25, result: 'winner' },
      { odd_decimal: 3.0, result: 'winner' },
      { odd_decimal: 4.0, result: 'winner' },
    ];
    const legs4: DeepLeg[] = [
      { odd_decimal: 5.0, rule_4: 25, result: 'winner' },
      { odd_decimal: 3.0, result: 'winner' },
      { odd_decimal: 4.0, result: 'winner' },
      { odd_decimal: 2.0, result: 'winner' },
    ];
    // ref: R4(5)=4, double = 4*3=12; treble = 4*3*4=48; fold4 = 4*3*4*2=96
    // trixie = doubles + treble: only 1 combo for each since legs2 is 2 legs only → use legs3 for trixie
    const legs3t: DeepLeg[] = legs3; // 3 legs for trixie

    it('double', () => {
      const ref = referenceDeepSettle(legs2, 'double', 1, false);
      expect(ref.return).toBeCloseTo(12, 2);
      const r = runProcessBet(bc, legs2, BetSlipType.DOUBLE, 1, false, false);
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });

    it('treble', () => {
      const ref = referenceDeepSettle(legs3, 'treble', 1, false);
      expect(ref.return).toBeCloseTo(48, 2);
      const r = runProcessBet(bc, legs3, BetSlipType.TREBLE, 1, false, false);
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });

    it('fold4', () => {
      const ref = referenceDeepSettle(legs4, 'fold4', 1, false);
      expect(ref.return).toBeCloseTo(96, 2);
      const r = bc.processBet({
        stake: 1,
        total_stake: 1,
        bets: legs4.map((l, i) => deepToBet(l, i, 1, false)),
        bet_type: BetSlipType.FOLD,
        fold_type: 4,
        free_bet_amount: 0,
        bog_applicable: false,
        bog_max_payout: 0,
        max_payout: 0,
        each_way: false,
      });
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });

    it('trixie', () => {
      // Trixie = 3 doubles + 1 treble from 3 legs.
      // With R4 leg: doubles (5R4,3), (5R4,4), (3,4) = 4*3 + 4*4 + 3*4 = 12+16+12 = 40
      // treble = 4*3*4 = 48. Total = 88.
      const ref = referenceDeepSettle(legs3t, 'trixie', 1, false);
      expect(ref.return).toBeCloseTo(40 + 48, 2);
      const r = runProcessBet(bc, legs3t, BetSlipType.TRIXIE, 1, false, false);
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });
  });

  // ── Case 2: SP-better BOG ──────────────────────────────────────────────────
  // winner@4 (sp=6, bog=true) + winner@2 (sp=2, no improvement).
  // ELBAPI BOG: SP 6 > placed 4 → bog_odd = 6. R4 path: 4. BOG path: 6.
  // bog_amount_won = (6*2) - (4*2) = 4.
  describe('SP-better BOG (winner@4 sp=6 bog + winner@2)', () => {
    const legs2: DeepLeg[] = [
      { odd_decimal: 4.0, sp_odd_decimal: 6.0, bog_applicable: true, result: 'winner' },
      { odd_decimal: 2.0, sp_odd_decimal: 2.0, result: 'winner' }, // sp=placed: no improvement
    ];
    const legs3: DeepLeg[] = [
      { odd_decimal: 4.0, sp_odd_decimal: 6.0, bog_applicable: true, result: 'winner' },
      { odd_decimal: 2.0, sp_odd_decimal: 2.0, result: 'winner' },
      { odd_decimal: 3.0, sp_odd_decimal: 3.0, result: 'winner' },
    ];

    it('double: return_payout includes BOG top-up; bog_amount_won > 0', () => {
      const ref = referenceDeepSettle(legs2, 'double', 1, false);
      // ref.return = 4*2*1 = 8; ref.bog = 6*2*1 - 4*2*1 = 4; total = 12
      expect(ref.return).toBeCloseTo(8, 2);
      expect(ref.bog_amount_won).toBeCloseTo(4, 2);
      const r = runProcessBet(bc, legs2, BetSlipType.DOUBLE, 1, false, true);
      expect(r.return_payout).toBeCloseTo(ref.return + ref.bog_amount_won, 2);
      expect(r.bog_amount_won).toBeCloseTo(ref.bog_amount_won, 2);
    });

    it('treble: return_payout includes BOG top-up; bog_amount_won > 0', () => {
      const ref = referenceDeepSettle(legs3, 'treble', 1, false);
      // R4 = 4*2*3=24; BOG = 6*2*3=36; bog = 12
      expect(ref.return).toBeCloseTo(24, 2);
      expect(ref.bog_amount_won).toBeCloseTo(12, 2);
      const r = runProcessBet(bc, legs3, BetSlipType.TREBLE, 1, false, true);
      expect(r.return_payout).toBeCloseTo(ref.return + ref.bog_amount_won, 2);
      expect(r.bog_amount_won).toBeCloseTo(ref.bog_amount_won, 2);
    });
  });

  // ── Case 3: placed-better BOG ──────────────────────────────────────────────
  // winner@6 (sp=4, bog=true) + winner@2 (sp=2). Placed (6) > SP (4) → no BOG gain.
  // bog_amount_won = 0.
  describe('placed-better BOG (winner@6 sp=4 bog + winner@2)', () => {
    const legs2: DeepLeg[] = [
      { odd_decimal: 6.0, sp_odd_decimal: 4.0, bog_applicable: true, result: 'winner' },
      { odd_decimal: 2.0, sp_odd_decimal: 2.0, result: 'winner' },
    ];
    const legs3: DeepLeg[] = [
      { odd_decimal: 6.0, sp_odd_decimal: 4.0, bog_applicable: true, result: 'winner' },
      { odd_decimal: 2.0, sp_odd_decimal: 2.0, result: 'winner' },
      { odd_decimal: 3.0, sp_odd_decimal: 3.0, result: 'winner' },
    ];

    it('double: bog_amount_won == 0', () => {
      const ref = referenceDeepSettle(legs2, 'double', 1, false);
      // ref.return = 6*2=12; bog = max(0, 6*2 - 6*2) = 0
      expect(ref.return).toBeCloseTo(12, 2);
      expect(ref.bog_amount_won).toBeCloseTo(0, 2);
      const r = runProcessBet(bc, legs2, BetSlipType.DOUBLE, 1, false, true);
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
      expect(r.bog_amount_won).toBeCloseTo(0, 2);
    });

    it('treble: bog_amount_won == 0', () => {
      const ref = referenceDeepSettle(legs3, 'treble', 1, false);
      expect(ref.bog_amount_won).toBeCloseTo(0, 2);
      const r = runProcessBet(bc, legs3, BetSlipType.TREBLE, 1, false, true);
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
      expect(r.bog_amount_won).toBeCloseTo(0, 2);
    });
  });

  // ── Case 4: each-way (winner+placed) ──────────────────────────────────────
  // winner@5 ew=1/4 + placed@4 ew=1/5. EW double, stake=1.
  // place_odd(5, 1/4) = (5-1)*0.25+1 = 2.0
  // place_odd(4, 1/5) = (4-1)*0.20+1 = 1.6
  // win combo: 5*0=0; place combo: 2.0*1.6=3.2. Total=3.2.
  describe('each-way double winner@5 ew=1/4 + placed@4 ew=1/5', () => {
    const legs2: DeepLeg[] = [
      { odd_decimal: 5.0, ew_terms: '1/4', result: 'winner' },
      { odd_decimal: 4.0, ew_terms: '1/5', result: 'placed' },
    ];
    const legs3: DeepLeg[] = [
      { odd_decimal: 5.0, ew_terms: '1/4', result: 'winner' },
      { odd_decimal: 4.0, ew_terms: '1/5', result: 'placed' },
      { odd_decimal: 3.0, ew_terms: '1/4', result: 'winner' },
    ];

    it('double', () => {
      const ref = referenceDeepSettle(legs2, 'double', 1, true);
      expect(ref.return).toBeCloseTo(3.2, 2);
      const r = runProcessBet(bc, legs2, BetSlipType.DOUBLE, 1, true, false);
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });

    it('treble (winner@5/1-4 + placed@4/1-5 + winner@3/1-4): win + place combos', () => {
      // Treble combinations from 3 legs with placed in position 2:
      // ELBAPI getNFoldReturnAmountWithWinners: all legs enter as winners/placed/void.
      // placed leg: odd=0, place_odd=1.6
      // winner@5: odd=5, place_odd=2.0
      // winner@3: odd=3, place_odd=(3-1)*0.25+1=1.5
      // Only one 3-combo: (5,placed,3).
      // win: 5*0*3=0. place: 2.0*1.6*1.5=4.8.
      // ref = 0*1 + 4.8*1 = 4.8
      const ref = referenceDeepSettle(legs3, 'treble', 1, true);
      expect(ref.return).toBeCloseTo(4.8, 2);
      const r = runProcessBet(bc, legs3, BetSlipType.TREBLE, 1, true, false);
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });
  });

  // ── Case 5: dead-heat partial_win_percent 50 ───────────────────────────────
  // winner@5 partial_percent=50 (2-way dead heat) + winner@3. Double, stake=1.
  // ELBAPI: adjustedOdd = 5*(50/100) = 2.5. gross = 2.5*3*1 = 7.5.
  // BetCalculator: win_stake = 1*(1-50/100) = 0.5. gross = 5*3*0.5 = 7.5.
  // Algebraically equivalent — empirical PASS confirms this.
  describe('dead-heat partial_win_percent 50 (winner@5 dh50% + winner@3)', () => {
    const legs2: DeepLeg[] = [
      { odd_decimal: 5.0, partial_percent: 50, result: 'winner' },
      { odd_decimal: 3.0, result: 'winner' },
    ];
    const legs3: DeepLeg[] = [
      { odd_decimal: 5.0, partial_percent: 50, result: 'winner' },
      { odd_decimal: 3.0, result: 'winner' },
      { odd_decimal: 4.0, result: 'winner' },
    ];
    const legs4: DeepLeg[] = [
      { odd_decimal: 5.0, partial_percent: 50, result: 'winner' },
      { odd_decimal: 3.0, result: 'winner' },
      { odd_decimal: 4.0, result: 'winner' },
      { odd_decimal: 2.0, result: 'winner' },
    ];

    it('double: ELBAPI odd-level dead-heat == BetCalculator stake-level dead-heat', () => {
      const ref = referenceDeepSettle(legs2, 'double', 1, false);
      // ref: 2.5*3*1 = 7.5
      expect(ref.return).toBeCloseTo(7.5, 2);
      const r = runProcessBet(bc, legs2, BetSlipType.DOUBLE, 1, false, false);
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });

    it('treble', () => {
      const ref = referenceDeepSettle(legs3, 'treble', 1, false);
      // ref: 2.5*3*4*1 = 30
      expect(ref.return).toBeCloseTo(30, 2);
      const r = runProcessBet(bc, legs3, BetSlipType.TREBLE, 1, false, false);
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });

    it('fold4', () => {
      const ref = referenceDeepSettle(legs4, 'fold4', 1, false);
      // ref: 2.5*3*4*2*1 = 60
      expect(ref.return).toBeCloseTo(60, 2);
      const r = bc.processBet({
        stake: 1,
        total_stake: 1,
        bets: legs4.map((l, i) => deepToBet(l, i, 1, false)),
        bet_type: BetSlipType.FOLD,
        fold_type: 4,
        free_bet_amount: 0,
        bog_applicable: false,
        bog_max_payout: 0,
        max_payout: 0,
        each_way: false,
      });
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });

    it('trixie', () => {
      // 3 legs: dead-heat@5 + @3 + @4.
      // doubles: (2.5,3)=7.5, (2.5,4)=10, (3,4)=12. Sum=29.5.
      // treble: 2.5*3*4=30. Total=59.5.
      const ref = referenceDeepSettle(legs3, 'trixie', 1, false);
      expect(ref.return).toBeCloseTo(59.5, 2);
      const r = runProcessBet(bc, legs3, BetSlipType.TRIXIE, 1, false, false);
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });
  });

  // ── Case 6: void leg ──────────────────────────────────────────────────────
  // winner@2 + void@3. Void acts as ×1 (stake pass-through).
  // ELBAPI: void → odd=1. combo = 2*1*1 = 2.
  // BetCalculator: void → VOID result, neutral multiplier.
  describe('void leg (winner@2 + void@3)', () => {
    const legs2: DeepLeg[] = [
      { odd_decimal: 2.0, result: 'winner' },
      { odd_decimal: 3.0, result: 'void' },
    ];
    const legs3: DeepLeg[] = [
      { odd_decimal: 2.0, result: 'winner' },
      { odd_decimal: 3.0, result: 'void' },
      { odd_decimal: 4.0, result: 'winner' },
    ];
    const legs4: DeepLeg[] = [
      { odd_decimal: 2.0, result: 'winner' },
      { odd_decimal: 3.0, result: 'void' },
      { odd_decimal: 4.0, result: 'winner' },
      { odd_decimal: 2.5, result: 'winner' },
    ];

    it('double', () => {
      const ref = referenceDeepSettle(legs2, 'double', 1, false);
      // ref: 2*1*1 = 2
      expect(ref.return).toBeCloseTo(2, 2);
      const r = runProcessBet(bc, legs2, BetSlipType.DOUBLE, 1, false, false);
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });

    it('treble', () => {
      const ref = referenceDeepSettle(legs3, 'treble', 1, false);
      // ref: 2*1*4*1 = 8
      expect(ref.return).toBeCloseTo(8, 2);
      const r = runProcessBet(bc, legs3, BetSlipType.TREBLE, 1, false, false);
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });

    it('fold4', () => {
      const ref = referenceDeepSettle(legs4, 'fold4', 1, false);
      // ref: 2*1*4*2.5*1 = 20
      expect(ref.return).toBeCloseTo(20, 2);
      const r = bc.processBet({
        stake: 1,
        total_stake: 1,
        bets: legs4.map((l, i) => deepToBet(l, i, 1, false)),
        bet_type: BetSlipType.FOLD,
        fold_type: 4,
        free_bet_amount: 0,
        bog_applicable: false,
        bog_max_payout: 0,
        max_payout: 0,
        each_way: false,
      });
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });

    it('trixie', () => {
      // 3 legs: winner@2 + void@3 + winner@4.
      // doubles: (2,void)=2*1=2, (2,4)=8, (void,4)=1*4=4. Sum=14.
      // treble: 2*1*4=8. Total=22.
      const ref = referenceDeepSettle(legs3, 'trixie', 1, false);
      expect(ref.return).toBeCloseTo(22, 2);
      const r = runProcessBet(bc, legs3, BetSlipType.TRIXIE, 1, false, false);
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });
  });

  // ── Case 7 (F1): R4 + dead-heat combined — KNOWN DIVERGENCE ─────────────
  //
  // ELBAPI non-BOG R4 path (playbookResultMultiples.js lines 404-413):
  //   baseOdd = originalOdd (PRE-dead-heat raw odd)
  //   row.odd = oddAfterRule4(baseOdd, r4)   ← dead-heat dropped — not re-applied
  //
  // ELBAPI wins with R4(rawOdd), no dead-heat factor:
  //   Leg: odd=5, rule_4=25 → R4(5) = 1+(5-1)*0.75 = 4.0  (DH factor 0.5 is dropped)
  //   double: 4.0 * 3 * 1 = 12.0
  //   treble: 4.0 * 3 * 4 * 1 = 48.0
  //
  // BetCalculator applies BOTH R4 and dead-heat:
  //   Leg: odd after R4 = 4.0; win_stake = 1*(1-50/100) = 0.5; effective = 4.0*0.5 = 2.0
  //   double: 2.0 * 3 * 1 = 6.0
  //   treble: 2.0 * 3 * 4 * 1 = 24.0
  //
  // These two systems legitimately diverge. The reference (ELBAPI oracle) and processBet
  // are BOTH asserted on their own values below. Do NOT loosen or skip — keep divergence explicit.
  // Resolution: deferred to SP-1 production shadow-run; preserve-vs-fix decided at cutover.
  describe('F1: R4 + dead-heat combined — KNOWN DIVERGENCE (winner@5 r4=25% dh50% + winner@3)', () => {
    const legs2: DeepLeg[] = [
      { odd_decimal: 5.0, rule_4: 25, partial_percent: 50, result: 'winner' },
      { odd_decimal: 3.0, result: 'winner' },
    ];
    const legs3: DeepLeg[] = [
      { odd_decimal: 5.0, rule_4: 25, partial_percent: 50, result: 'winner' },
      { odd_decimal: 3.0, result: 'winner' },
      { odd_decimal: 4.0, result: 'winner' },
    ];

    it('double: KNOWN R4+dead-heat divergence — reference (ELBAPI) = 12.0, processBet = 6.0', () => {
      // KNOWN R4+dead-heat divergence:
      //   ELBAPI drops dead-heat on R4 legs (non-BOG path, playbookResultMultiples.js lines 404-413).
      //   Shared engine applies both R4 and DH.
      //   Quantified by the SP-1 production shadow-run; preserve-vs-fix decided at cutover.
      const ref = referenceDeepSettle(legs2, 'double', 1, false);
      // ELBAPI faithful reference: R4(5)=4.0, DH dropped → 4.0*3*1 = 12.0
      expect(ref.return).toBeCloseTo(12.0, 2);

      const r = runProcessBet(bc, legs2, BetSlipType.DOUBLE, 1, false, false);
      // BetCalculator applies both: R4(5)=4.0, DH=0.5 → 4.0*0.5*3*1 = 6.0
      expect(r.return_payout).toBeCloseTo(6.0, 2);

      // Confirm they differ (documents the divergence is real, not a copy-paste error)
      expect(ref.return).not.toBeCloseTo(r.return_payout, 2);
    });

    it('treble: KNOWN R4+dead-heat divergence — reference (ELBAPI) = 48.0, processBet = 24.0', () => {
      // KNOWN R4+dead-heat divergence:
      //   ELBAPI drops dead-heat on R4 legs (non-BOG path, playbookResultMultiples.js lines 404-413).
      //   Shared engine applies both R4 and DH.
      //   Quantified by the SP-1 production shadow-run; preserve-vs-fix decided at cutover.
      const ref = referenceDeepSettle(legs3, 'treble', 1, false);
      // ELBAPI faithful reference: R4(5)=4.0, DH dropped → 4.0*3*4*1 = 48.0
      expect(ref.return).toBeCloseTo(48.0, 2);

      const r = runProcessBet(bc, legs3, BetSlipType.TREBLE, 1, false, false);
      // BetCalculator applies both: R4(5)=4.0, DH=0.5 → 4.0*0.5*3*4*1 = 24.0
      expect(r.return_payout).toBeCloseTo(24.0, 2);

      // Confirm they differ (documents the divergence is real, not a copy-paste error)
      expect(ref.return).not.toBeCloseTo(r.return_payout, 2);
    });
  });

  // ── Case 8 (F2): 3-way dead heat ─────────────────────────────────────────
  // ELBAPI partialPercent = 100/3 ≈ 33.33 (3 runners tying).
  // adjustedOdd = odd * (100/3 / 100) = odd * (1/3).
  //
  // BetCalculator mapping (EMPIRICALLY DETERMINED):
  //   partial_win_percent = 100 - partialPercent = 100 - 33.33 = 66.67
  //   win_stake = stake * (1 - 66.67/100) = stake * 0.3333
  //   gross = odd * other * stake * 0.3333  ==  odd*(1/3) * other * stake  ✓
  //
  // Leg: odd=6, partial_percent=100/3; other: odd=3.
  //   adjustedOdd = 6*(1/3) = 2.0
  //   Double ref = 2.0*3*1 = 6.0
  describe('F2: 3-way dead heat (winner@6 dh=100/3 + winner@3)', () => {
    const partialPercent3way = 100 / 3; // ≈ 33.33
    const legs2: DeepLeg[] = [
      { odd_decimal: 6.0, partial_percent: partialPercent3way, result: 'winner' },
      { odd_decimal: 3.0, result: 'winner' },
    ];
    const legs3: DeepLeg[] = [
      { odd_decimal: 6.0, partial_percent: partialPercent3way, result: 'winner' },
      { odd_decimal: 3.0, result: 'winner' },
      { odd_decimal: 2.0, result: 'winner' },
    ];

    it('double: 3-way DH reference and BetCalculator(pwp=66.67) match', () => {
      const ref = referenceDeepSettle(legs2, 'double', 1, false);
      // adjustedOdd = 6*(1/3)=2.0; ref = 2.0*3*1 = 6.0
      expect(ref.return).toBeCloseTo(6.0, 2);
      const r = runProcessBet(bc, legs2, BetSlipType.DOUBLE, 1, false, false);
      // BetCalculator: partial_win_percent = 100 - 33.33 = 66.67 (via deepToBet transform)
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });

    it('treble: 3-way DH reference and BetCalculator(pwp=66.67) match', () => {
      const ref = referenceDeepSettle(legs3, 'treble', 1, false);
      // adjustedOdd = 2.0; ref = 2.0*3*2*1 = 12.0
      expect(ref.return).toBeCloseTo(12.0, 2);
      const r = runProcessBet(bc, legs3, BetSlipType.TREBLE, 1, false, false);
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });
  });

  // ── Case 9 (F2): 4-way dead heat ─────────────────────────────────────────
  // ELBAPI partialPercent = 100/4 = 25 (4 runners tying).
  // adjustedOdd = odd * 0.25.
  //
  // BetCalculator mapping (EMPIRICALLY DETERMINED):
  //   partial_win_percent = 100 - 25 = 75
  //   win_stake = stake * (1 - 75/100) = stake * 0.25
  //   gross = odd * other * stake * 0.25  ==  odd*0.25 * other * stake  ✓
  //
  // Leg: odd=8, partial_percent=25; other: odd=3.
  //   adjustedOdd = 8*0.25 = 2.0
  //   Double ref = 2.0*3*1 = 6.0
  describe('F2: 4-way dead heat (winner@8 dh=25 + winner@3)', () => {
    const partialPercent4way = 25; // 100/4
    const legs2: DeepLeg[] = [
      { odd_decimal: 8.0, partial_percent: partialPercent4way, result: 'winner' },
      { odd_decimal: 3.0, result: 'winner' },
    ];
    const legs3: DeepLeg[] = [
      { odd_decimal: 8.0, partial_percent: partialPercent4way, result: 'winner' },
      { odd_decimal: 3.0, result: 'winner' },
      { odd_decimal: 2.0, result: 'winner' },
    ];

    it('double: 4-way DH reference and BetCalculator(pwp=75) match', () => {
      const ref = referenceDeepSettle(legs2, 'double', 1, false);
      // adjustedOdd = 8*0.25=2.0; ref = 2.0*3*1 = 6.0
      expect(ref.return).toBeCloseTo(6.0, 2);
      const r = runProcessBet(bc, legs2, BetSlipType.DOUBLE, 1, false, false);
      // BetCalculator: partial_win_percent = 100 - 25 = 75 (via deepToBet transform)
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });

    it('treble: 4-way DH reference and BetCalculator(pwp=75) match', () => {
      const ref = referenceDeepSettle(legs3, 'treble', 1, false);
      // adjustedOdd = 2.0; ref = 2.0*3*2*1 = 12.0
      expect(ref.return).toBeCloseTo(12.0, 2);
      const r = runProcessBet(bc, legs3, BetSlipType.TREBLE, 1, false, false);
      expect(r.return_payout).toBeCloseTo(ref.return, 2);
    });
  });

  // ── Case 10 (F3): Trixie BOG (SP-better on one leg) ─────────────────────
  // 3 legs: A(@4 sp=6 BOG), B(@2 sp=2 no improvement), C(@3 sp=3 no improvement).
  // Trixie = 3 doubles (AB, AC, BC) + 1 treble (ABC), stake=1 per line.
  //
  // R4 returns: AB=4*2=8, AC=4*3=12, BC=2*3=6, ABC=4*2*3=24. Total R4=50.
  // BOG returns (SP=6 for A > placed=4): AB=6*2=12, AC=6*3=18, BC=2*3=6, ABC=6*2*3=36. Total BOG=72.
  //
  // Reference aggregate: bog_amount_won = max(0, 72-50) = 22.
  // BetCalculator per-combo: each combo max(0, bog-r4) summed.
  //   AB: max(0,12-8)=4; AC: max(0,18-12)=6; BC: max(0,6-6)=0; ABC: max(0,36-24)=12. Sum=22.
  // Both methods give 22 — no bucketing divergence for this trixie case.
  //
  // return_payout = ref.return + ref.bog_amount_won = 50 + 22 = 72.
  describe('F3: trixie BOG (A@4 sp=6 + B@2 + C@3), stake=1 per line', () => {
    const legs3: DeepLeg[] = [
      { odd_decimal: 4.0, sp_odd_decimal: 6.0, bog_applicable: true, result: 'winner' },
      { odd_decimal: 2.0, sp_odd_decimal: 2.0, result: 'winner' },
      { odd_decimal: 3.0, sp_odd_decimal: 3.0, result: 'winner' },
    ];

    it('trixie: return_payout and bog_amount_won match reference', () => {
      const ref = referenceDeepSettle(legs3, 'trixie', 1, false);
      // R4 total = AB+AC+BC+ABC = 8+12+6+24 = 50
      expect(ref.return).toBeCloseTo(50, 2);
      // BOG total = 12+18+6+36 = 72; bog_amount_won = max(0, 72-50) = 22
      expect(ref.bog_amount_won).toBeCloseTo(22, 2);

      const r = runProcessBet(bc, legs3, BetSlipType.TRIXIE, 1, false, true);
      // BetCalculator: per-combo BOG sum = 4+6+0+12 = 22
      expect(r.bog_amount_won).toBeCloseTo(ref.bog_amount_won, 2);
      expect(r.return_payout).toBeCloseTo(ref.return + ref.bog_amount_won, 2);
    });
  });
});

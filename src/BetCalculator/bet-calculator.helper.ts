import { BetOddType } from '../common/constants/betOddType';
import { BetResultType } from '../common/constants/betResultType';
import type { BetOdd, BetOdds } from '../common/dto';
import type { PlacedBetSelection, ResultCombination, ResultMainBet } from '../common/dto/PlacedBet';

export class BetCalculatorHelper {
  validatePayout = ({
    max_payout,
    max_bog_payout,
    free_bet_amount,
    stake,
    bog_amount_won,
    win_profit,
    place_profit,
  }) => {
    let return_amount = +win_profit + +place_profit;

    if (+bog_amount_won > 0) {
      if (+max_bog_payout > 0 && +bog_amount_won > +max_bog_payout) {
        bog_amount_won = +max_bog_payout;
        // return_amount = return_amount - (+bog_amount_won - +max_bog_payout);
        return_amount = return_amount + bog_amount_won;
      } else {
        return_amount = return_amount + bog_amount_won;
      }
    }

    if (+free_bet_amount == 0 && +stake > 0) {
      return_amount = +return_amount + +stake;
    }

    if (Number(max_payout) > 0 && Number(return_amount) > Number(max_payout)) {
      return_amount = max_payout;
    }

    return {
      payout: return_amount,
      bog_amount_won,
      free_bet_amount,
      stake: +free_bet_amount == 0 ? stake : 0,
    };
  };

  retrieveOdds = (selection: PlacedBetSelection): BetOdds => {
    const retrieved_odds = {
      main: this.retrieveSelectionOdd(selection),
      sp: this.retrieveStartingPriceOdd(selection),
      bog: this.retrieveBogOdd(selection),
    };

    return retrieved_odds;
  };

  retrieveEachWayOdds = (odds: BetOdds, ew_terms: string | null): BetOdds | null => {
    if (!ew_terms) {
      return null;
    }

    const each_way_term = this.getEachWayTerm(ew_terms);

    return {
      main: {
        numerator: odds.main.numerator,
        denominator: odds.main.denominator * each_way_term,
        odd_decimal: this.roundToDecimalPlaces(odds.main.odd_decimal * (1 / each_way_term)),
      },
      sp: {
        numerator: odds.sp.numerator,
        denominator: odds.sp.denominator * each_way_term,
        odd_decimal: this.roundToDecimalPlaces(odds.sp.odd_decimal * (1 / each_way_term)),
      },
      bog: {
        numerator: odds.bog.numerator,
        denominator: odds.bog.denominator * each_way_term,
        odd_decimal: this.roundToDecimalPlaces(odds.bog.odd_decimal * (1 / each_way_term)),
      },
    };
  };

  retrieveSelectionOdd = (selection: PlacedBetSelection): BetOdd => {
    let numerator = 0;
    let denominator = 0;

    if (selection.odd_fractional && selection.odd_fractional != 'SP' && selection.odd_fractional?.includes('/')) {
      ({ numerator, denominator } = this.getFractionalValues(selection.odd_fractional));
    } else if (selection.odd_decimal) {
      ({ numerator, denominator } = { numerator: selection.odd_decimal - 1, denominator: 1 });
    } else if (selection.odd_decimal === 0 || selection.odd_decimal === null || selection.odd_decimal === undefined) {
      ({ numerator, denominator } = { numerator: 0, denominator: 1 });
    }

    if (selection.rule_4 && selection.rule_4 > 0 && selection.rule_4 < 100) {
      ({ numerator, denominator } = this.calculateRule4Odds(
        { numerator, denominator, odd_decimal: this.roundToDecimalPlaces(+numerator / +denominator) },
        selection.rule_4,
      ));
    }

    return { numerator, denominator, odd_decimal: this.roundToDecimalPlaces(+numerator / +denominator) };
  };

  retrieveStartingPriceOdd = (selection: PlacedBetSelection): BetOdd => {
    let numerator = 0;
    let denominator = 1;

    if (
      selection.is_starting_price &&
      selection.sp_odd_fractional &&
      selection.sp_odd_fractional != 'SP' &&
      selection.sp_odd_fractional?.includes('/')
    ) {
      ({ numerator, denominator } = this.getFractionalValues(selection.sp_odd_fractional));
    } else if (selection.sp_odd_decimal) {
      ({ numerator, denominator } = { numerator: selection.sp_odd_decimal - 1, denominator: 1 });
    } else if (
      selection.sp_odd_decimal === 0 ||
      selection.sp_odd_decimal === null ||
      selection.sp_odd_decimal === undefined
    ) {
      ({ numerator, denominator } = { numerator: 0, denominator: 1 });
    }

    if (selection.rule_4 && selection.rule_4 > 0 && selection.rule_4 < 100) {
      ({ numerator, denominator } = this.calculateRule4Odds(
        { numerator, denominator, odd_decimal: this.roundToDecimalPlaces(+numerator / +denominator) },
        selection.rule_4,
      ));
    }

    return { numerator, denominator, odd_decimal: this.roundToDecimalPlaces(+numerator / +denominator) };
  };

  retrieveBogOdd = (selection: PlacedBetSelection): BetOdd => {
    let bog_odd_numerator = 0;
    let bog_odd_denominator = 1;

    if (
      selection.sp_odd_fractional &&
      selection.sp_odd_fractional != 'SP' &&
      selection.odd_fractional?.includes('/') &&
      selection.odd_fractional &&
      selection.odd_fractional != 'SP' &&
      selection.odd_fractional?.includes('/')
    ) {
      const { numerator: odd_numerator, denominator: odd_denominator } = this.getFractionalValues(
        selection.odd_fractional,
      );
      const { numerator: sp_numerator, denominator: sp_denominator } = this.getFractionalValues(
        selection.sp_odd_fractional,
      );

      if (sp_numerator / sp_denominator > odd_numerator / odd_denominator) {
        bog_odd_numerator = sp_numerator;
        bog_odd_denominator = sp_denominator;
      } else {
        bog_odd_numerator = odd_numerator;
        bog_odd_denominator = odd_denominator;
      }
    } else if (selection.sp_odd_decimal && selection.odd_decimal) {
      if (selection.sp_odd_decimal > selection.odd_decimal) {
        bog_odd_numerator = selection.sp_odd_decimal - 1;
        bog_odd_denominator = 1;
      } else {
        bog_odd_numerator = selection.odd_decimal - 1;
        bog_odd_denominator = 1;
      }
    }

    if (selection.rule_4 && selection.rule_4 > 0 && selection.rule_4 < 100) {
      ({ numerator: bog_odd_numerator, denominator: bog_odd_denominator } = this.calculateRule4Odds(
        {
          numerator: bog_odd_numerator,
          denominator: bog_odd_denominator,
          odd_decimal: this.roundToDecimalPlaces(+bog_odd_numerator / +bog_odd_denominator),
        },
        selection.rule_4,
      ));
    }

    return {
      numerator: bog_odd_numerator,
      denominator: bog_odd_denominator,
      odd_decimal: this.roundToDecimalPlaces(+bog_odd_numerator / +bog_odd_denominator),
    };
  };

  getSingleResultOdds = (
    selection: PlacedBetSelection,
    odds: BetOdds,
    each_way_odds: BetOdds | null,
  ): { win_odd: BetOdds; place_odd: BetOdds; result_type: BetResultType } => {
    const win_odd: BetOdds = {
      main: { numerator: 0, denominator: 1, odd_decimal: 0 },
      sp: { numerator: 0, denominator: 1, odd_decimal: 0 },
      bog: { numerator: 0, denominator: 1, odd_decimal: 0 },
    };
    const place_odd: BetOdds = {
      main: { numerator: 0, denominator: 1, odd_decimal: 0 },
      sp: { numerator: 0, denominator: 1, odd_decimal: 0 },
      bog: { numerator: 0, denominator: 1, odd_decimal: 0 },
    };

    let result_type = BetResultType.LOSER;

    if (selection.result === BetResultType.WINNER || selection.result === BetResultType.PARTIAL) {
      win_odd.main = this.getOdds(odds, BetOddType.MAIN);
      win_odd.sp = this.getOdds(odds, BetOddType.SP);
      win_odd.bog = this.getOdds(odds, BetOddType.BOG);
      place_odd.main = this.getOdds(each_way_odds, BetOddType.MAIN);
      place_odd.sp = this.getOdds(each_way_odds, BetOddType.SP);
      place_odd.bog = this.getOdds(each_way_odds, BetOddType.BOG);
      result_type = BetResultType.WINNER;
    } else if (selection.result === BetResultType.PLACED && each_way_odds) {
      place_odd.main = this.getOdds(each_way_odds, BetOddType.MAIN);
      place_odd.sp = this.getOdds(each_way_odds, BetOddType.SP);
      place_odd.bog = this.getOdds(each_way_odds, BetOddType.BOG);
      result_type = BetResultType.PLACED;
    } else if (selection.result === BetResultType.VOID) {
      win_odd.main = { numerator: 0, denominator: 0, odd_decimal: 0 };
      win_odd.sp = { numerator: 0, denominator: 0, odd_decimal: 0 };
      win_odd.bog = { numerator: 0, denominator: 0, odd_decimal: 0 };
      place_odd.main = { numerator: 0, denominator: 0, odd_decimal: 0 };
      place_odd.sp = { numerator: 0, denominator: 0, odd_decimal: 0 };
      place_odd.bog = { numerator: 0, denominator: 0, odd_decimal: 0 };
      result_type = BetResultType.VOID;
    } else if (selection.result === BetResultType.LOSER) {
      // do nothing, already set to 0
      result_type = BetResultType.LOSER;
    } else if (selection.result === BetResultType.HALF_WON) {
      // HALF_WON: effective full decimal return = (profit_odd + 1) / 2.
      // odds.main.odd_decimal is the PROFIT fraction (numerator/denominator), so
      // full decimal = odds.main.odd_decimal + 1.  Halved: (odds.main.odd_decimal + 1) / 2.
      // Stored as profit form: numerator = effective_full_decimal - 1, denominator = 1.
      // calculateCombinationFractional computes (numerator+denominator)/denominator = effective_full_decimal ✓
      const makeHW = (profitOdd: number) => {
        const fullDecimal = (profitOdd + 1) / 2;
        const profitNum = fullDecimal - 1;
        // When fullDecimal === 1.0 the profit numerator is 0 with denominator 1,
        // which collides with the LOSER sentinel {0, 1} in calculateCombinationFractional
        // and would zero the entire combination product. Use the VOID/neutral sentinel
        // {0, 0} instead — calculateCombinationFractional skips it (×1 factor). ✓
        if (profitNum === 0) {
          return { numerator: 0, denominator: 0, odd_decimal: 0 };
        }
        return { numerator: profitNum, denominator: 1, odd_decimal: profitNum };
      };
      win_odd.main = makeHW(odds.main.odd_decimal);
      win_odd.sp = makeHW(odds.sp.odd_decimal);
      win_odd.bog = makeHW(odds.bog.odd_decimal);

      if (each_way_odds) {
        // For EW, production: place_odd = ((win_odd - 1) * (ew_n/ew_d) + 1) / 2.
        // each_way_odds.main.odd_decimal is already the EW profit fraction.
        // Full EW decimal = each_way_odds.main.odd_decimal + 1.  Halved: / 2.
        const makeHWPlace = (ewProfitOdd: number) => {
          const fullDecimal = (ewProfitOdd + 1) / 2;
          const profitNum = fullDecimal - 1;
          // Same evens-at-1.0 guard as makeHW above.
          if (profitNum === 0) {
            return { numerator: 0, denominator: 0, odd_decimal: 0 };
          }
          return { numerator: profitNum, denominator: 1, odd_decimal: profitNum };
        };
        place_odd.main = makeHWPlace(each_way_odds.main.odd_decimal);
        place_odd.sp = makeHWPlace(each_way_odds.sp.odd_decimal);
        place_odd.bog = makeHWPlace(each_way_odds.bog.odd_decimal);
      }
      result_type = BetResultType.HALF_WON;
    } else if (selection.result === BetResultType.HALF_LOST) {
      // HALF_LOST: effective decimal multiplier = 0.5 (returns half stake).
      // Fractional profit: numerator = 0.5 - 1 = -0.5, denominator = 1.
      // calculateCombinationFractional: (-0.5+1)/1 = 0.5 ✓
      win_odd.main = { numerator: -0.5, denominator: 1, odd_decimal: 0.5 };
      win_odd.sp = { numerator: -0.5, denominator: 1, odd_decimal: 0.5 };
      win_odd.bog = { numerator: -0.5, denominator: 1, odd_decimal: 0.5 };

      if (each_way_odds) {
        // EW HALF_LOST: production uses place_odd = 0.5 (half stake returned on place leg too)
        place_odd.main = { numerator: -0.5, denominator: 1, odd_decimal: 0.5 };
        place_odd.sp = { numerator: -0.5, denominator: 1, odd_decimal: 0.5 };
        place_odd.bog = { numerator: -0.5, denominator: 1, odd_decimal: 0.5 };
      }
      result_type = BetResultType.HALF_LOST;
    }

    return { win_odd, place_odd, result_type };
  };

  getCombinationOdds = (oddsList: BetOdds[]): BetOdds => {
    return {
      main: this.calculateCombinationFractional(oddsList.map((odd) => odd.main)),
      sp: this.calculateCombinationFractional(oddsList.map((odd) => odd.sp)),
      bog: this.calculateCombinationFractional(oddsList.map((odd) => odd.bog)),
    };
  };

  calculateCombinationFractional = (oddsList: BetOdd[]): BetOdd => {
    let numerator = 1;
    let denominator = 1;

    oddsList.forEach((odd) => {
      // this is loser
      if (odd.numerator === 0 && odd.denominator === 1) {
        numerator *= 0;
        denominator *= 0;
        return;
      }

      // Skip void/non-runner
      if (odd.numerator === 0 && odd.denominator === 0) {
        return;
      }

      // EVS (1/1)
      if (odd.numerator === 1 && odd.denominator === 1) {
        numerator *= 2;
        denominator *= 1;
        return;
      }

      numerator *= odd.numerator + odd.denominator;
      denominator *= odd.denominator;
    });

    if (denominator === 0) {
      return { numerator: 0, denominator: 0, odd_decimal: 0 };
    }

    const odd_decimal = numerator / denominator;
    const profit_numerator = numerator - denominator;
    const profit_denominator = denominator;

    return {
      numerator: profit_numerator,
      denominator: profit_denominator,
      odd_decimal: this.roundToDecimalPlaces(odd_decimal),
    };
  };

  calculateProfit = (odds: BetOdds | null, stake: number, type: BetOddType): number => {
    let profit = 0;

    if (!odds) {
      return 0;
    }

    if (type === BetOddType.MAIN && odds.main.denominator > 0) {
      profit = this.roundToDecimalPlaces((+odds.main.numerator / +odds.main.denominator) * stake);
    } else if (type === BetOddType.SP && odds.sp.denominator > 0) {
      profit = this.roundToDecimalPlaces((+odds.sp.numerator / +odds.sp.denominator) * stake);
    } else if (type === BetOddType.BOG && odds.bog.denominator > 0) {
      profit = this.roundToDecimalPlaces((+odds.bog.numerator / +odds.bog.denominator) * stake);
    }

    return profit;
  };

  getOdds = (odds: BetOdds | null, type: BetOddType): BetOdd => {
    if (!odds) {
      return {
        numerator: 0,
        denominator: 0,
        odd_decimal: 0,
      };
    }

    if (type === BetOddType.MAIN) {
      return odds.main;
    } else if (type === BetOddType.SP) {
      return odds.sp;
    } else if (type === BetOddType.BOG) {
      return odds.bog;
    } else {
      return {
        numerator: 0,
        denominator: 0,
        odd_decimal: 0,
      };
    }
  };

  calculatePartialWinPercent = (profit: number, partial_win_percent: number): number => {
    return this.roundToDecimalPlaces(+(profit * (partial_win_percent / 100)));
  };

  calculateRule4 = (profit: number, rule_4: number): number => {
    return this.roundToDecimalPlaces(Number(+(profit - (profit * rule_4) / 100)));
  };

  calculateRule4Odds = (odd: BetOdd, rule_4: number): BetOdd => {
    return {
      numerator: this.roundToDecimalPlaces(Number(+(odd.numerator - (odd.numerator * rule_4) / 100))),
      denominator: odd.denominator,
      odd_decimal: this.roundToDecimalPlaces(Number(+(odd.numerator - (odd.numerator * rule_4) / 100))),
    };
  };

  getFractionalValues = (fractional) => {
    if (fractional == 'SP' || fractional == '' || fractional == null || fractional == undefined || +fractional == 0) {
      return {
        numerator: 0,
        denominator: 1,
      };
    }

    if (fractional.includes('/')) {
      const [numerator, denominator] = fractional.split('/');
      return {
        numerator: +numerator,
        denominator: +denominator,
      };
    } else {
      return {
        numerator: +fractional,
        denominator: 1,
      };
    }
  };

  getEachWayTerm = (ew_terms) => {
    if (ew_terms && ew_terms.includes('/')) {
      return +ew_terms.split('/')[1];
    }

    return 1;
  };

  // this should get the amount with decimal places as precision, example: 1.2345 should return 1.23 or 1.333333 should return 1.33
  roundToDecimalPlaces = (amount: number): number => {
    const decimalPlaces = 2;

    return +amount.toFixed(decimalPlaces);
  };

  // if at least 1 combination is a winner, return Winner,
  // if at least 1 combination is a void, no winners, return Partial,
  // iff all same result, return that result
  getBetResultType = (combinations: PlacedBetSelection[], each_way: boolean): BetResultType => {
    const result_type = BetResultType.OPEN;

    if (combinations.length === 0) {
      return result_type;
    }

    const first_result = combinations[0].result;

    if (combinations.every((combination) => combination.result === first_result)) {
      return first_result;
    }

    if (
      combinations.every(
        (combination) =>
          combination.result === BetResultType.WINNER ||
          combination.result === BetResultType.PARTIAL ||
          combination.result === BetResultType.HALF_WON ||
          combination.result === BetResultType.HALF_LOST ||
          (combination.result === BetResultType.PLACED && each_way),
      )
    ) {
      return BetResultType.WINNER;
    } else if (
      combinations.every(
        (combination) => combination.result === BetResultType.LOSER || combination.result === BetResultType.OPEN,
      )
    ) {
      return BetResultType.LOSER;
    } else if (combinations.some((combination) => combination.result === BetResultType.LOSER)) {
      return BetResultType.LOSER;
    } else if (combinations.some((combination) => combination.result === BetResultType.VOID)) {
      return BetResultType.PARTIAL;
    } else if (
      combinations.some(
        (combination) =>
          combination.result === BetResultType.HALF_WON || combination.result === BetResultType.HALF_LOST,
      )
    ) {
      return BetResultType.WINNER;
    }

    return BetResultType.LOSER;
  };

  getCombinationsResultType = (combinations: ResultCombination[], each_way: boolean): BetResultType => {
    const result_type = BetResultType.OPEN;

    if (combinations.length === 0) {
      return result_type;
    }

    const first_result = combinations[0].result_type;

    if (combinations.every((combination) => combination.result_type === first_result)) {
      return first_result;
    }

    const has_winner = combinations.some((combination) => combination.result_type === BetResultType.WINNER);
    const has_void = combinations.some((combination) => combination.result_type === BetResultType.VOID);
    const has_placed = combinations.some(
      (combination) => combination.result_type === BetResultType.PLACED && !each_way,
    );
    const has_partial = combinations.some((combination) => combination.result_type === BetResultType.PARTIAL);

    if (has_winner) {
      return BetResultType.WINNER;
    }

    if (has_partial) {
      return BetResultType.PARTIAL;
    }

    if (has_placed) {
      return BetResultType.PLACED;
    }

    if (has_void) {
      return BetResultType.PARTIAL;
    }

    return BetResultType.LOSER;
  };

  getMainResultType = (combinations: ResultMainBet[], payout: number): BetResultType => {
    const result_type = BetResultType.OPEN;

    if (combinations.length === 0) {
      return result_type;
    }

    const first_result = combinations[0].result_type;

    if (combinations.every((combination) => combination.result_type === first_result)) {
      return first_result;
    }

    const has_winner = combinations.some((combination) => combination.result_type === BetResultType.WINNER);
    const has_partial = combinations.some(
      (combination) =>
        combination.result_type === BetResultType.PARTIAL || combination.result_type === BetResultType.PLACED,
    );
    const has_void = combinations.some((combination) => combination.result_type === BetResultType.VOID);

    if (has_winner && payout > 0) {
      return BetResultType.WINNER;
    }

    if (has_partial && payout > 0) {
      return BetResultType.PARTIAL;
    }

    if (has_void && payout > 0) {
      return BetResultType.PARTIAL;
    }

    return BetResultType.LOSER;
  };
}

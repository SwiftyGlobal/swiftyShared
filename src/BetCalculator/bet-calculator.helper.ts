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

    if (Number(max_bog_payout) > 0 && Number(bog_amount_won) > Number(max_bog_payout)) {
      bog_amount_won = +max_bog_payout;
      return_amount = return_amount - (+bog_amount_won - +max_bog_payout);
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

    console.log('retrieveOdds', JSON.stringify(retrieved_odds));

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

    if (selection.odd_fractional && selection.odd_fractional != 'SP') {
      ({ numerator, denominator } = this.getFractionalValues(selection.odd_fractional));
    } else if (selection.odd_decimal) {
      ({ numerator, denominator } = { numerator: selection.odd_decimal - 1, denominator: 1 });
    }

    return { numerator, denominator, odd_decimal: this.roundToDecimalPlaces(+numerator / +denominator) };
  };

  retrieveStartingPriceOdd = (selection: PlacedBetSelection): BetOdd => {
    if (selection.is_starting_price && selection.sp_odd_fractional && selection.sp_odd_fractional != 'SP') {
      const { numerator, denominator } = this.getFractionalValues(selection.sp_odd_fractional);
      return { numerator, denominator, odd_decimal: this.roundToDecimalPlaces(+numerator / +denominator) };
    } else if (selection.sp_odd_decimal) {
      return { numerator: selection.sp_odd_decimal - 1, denominator: 1, odd_decimal: selection.sp_odd_decimal };
    }

    return { numerator: 0, denominator: 1, odd_decimal: 1 };
  };

  retrieveBogOdd = (selection: PlacedBetSelection): BetOdd => {
    let bog_odd_numerator = 0;
    let bog_odd_denominator = 1;

    if (
      selection.sp_odd_fractional &&
      selection.sp_odd_fractional != 'SP' &&
      selection.odd_fractional &&
      selection.odd_fractional != 'SP'
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
    type: BetOddType,
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

    console.log('getSingleResultOdds', JSON.stringify({ selection, odds, each_way_odds, type }));

    if (selection.result === BetResultType.WINNER || selection.result === BetResultType.PARTIAL) {
      win_odd.main = this.getOdds(odds, type);
      win_odd.sp = this.getOdds(odds, type);
      win_odd.bog = this.getOdds(odds, type);
      place_odd.main = this.getOdds(each_way_odds, type);
      place_odd.sp = this.getOdds(each_way_odds, type);
      place_odd.bog = this.getOdds(each_way_odds, type);
      result_type = BetResultType.WINNER;
    } else if (selection.result === BetResultType.PLACED && selection.is_each_way) {
      place_odd.main = this.getOdds(each_way_odds, type);
      place_odd.sp = this.getOdds(each_way_odds, type);
      place_odd.bog = this.getOdds(each_way_odds, type);
      result_type = BetResultType.PLACED;
    } else if (selection.result === BetResultType.VOID) {
      win_odd.main = { numerator: 1, denominator: 1, odd_decimal: 1 };
      win_odd.sp = { numerator: 1, denominator: 1, odd_decimal: 1 };
      win_odd.bog = { numerator: 1, denominator: 1, odd_decimal: 1 };
      place_odd.main = { numerator: 1, denominator: 1, odd_decimal: 1 };
      place_odd.sp = { numerator: 1, denominator: 1, odd_decimal: 1 };
      place_odd.bog = { numerator: 1, denominator: 1, odd_decimal: 1 };
      result_type = BetResultType.VOID;
    } else if (selection.result === BetResultType.LOSER) {
      // do nothing, already set to 0
      result_type = BetResultType.LOSER;
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
      if ((odd.numerator == 0 && odd.denominator == 0) || (odd.numerator == 0 && odd.denominator == 1)) {
        numerator = 0;
        denominator = 0;
        return;
      }

      if (odd.numerator == 1 && odd.denominator == 1) {
        return;
      }

      numerator *= odd.numerator + odd.denominator;
      denominator *= odd.denominator;
    });

    numerator = numerator - denominator;

    return {
      numerator,
      denominator,
      odd_decimal: denominator > 0 ? this.roundToDecimalPlaces(numerator / denominator) : 0,
    };
  };

  calculateProfit = (odds: BetOdds | null, stake: number, type: BetOddType): number => {
    let profit = 0;

    if (!odds) {
      return 0;
    }

    if (type === BetOddType.MAIN && odds.main.denominator > 0) {
      profit = this.roundToDecimalPlaces((+odds.main.numerator / +odds.main.denominator) * stake);
      console.log('Main', JSON.stringify({ profit, stake, odds: odds.main }));
    } else if (type === BetOddType.SP && odds.sp.denominator > 0) {
      profit = this.roundToDecimalPlaces((+odds.sp.numerator / +odds.sp.denominator) * stake);
      console.log('SP', JSON.stringify({ profit, stake, odds: odds.sp }));
    } else if (type === BetOddType.BOG && odds.bog.denominator > 0) {
      profit = this.roundToDecimalPlaces((+odds.bog.numerator / +odds.bog.denominator) * stake);
      console.log('BOG', JSON.stringify({ profit, stake, odds: odds.bog }));
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

  calculatePartialWinPercent = (profit, partial_win_percent) => {
    return this.roundToDecimalPlaces(+(profit * (partial_win_percent / 100)));
  };

  calculateRule4 = (profit, rule_4) => {
    return this.roundToDecimalPlaces(Number(+(profit - (profit * rule_4) / 100)));
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
  getBetResultType = (combinations: PlacedBetSelection[]): BetResultType => {
    const result_type = BetResultType.OPEN;

    if (combinations.length === 0) {
      return result_type;
    }

    const first_result = combinations[0].result;

    if (combinations.every((combination) => combination.result === first_result)) {
      return first_result;
    }

    const has_winner = combinations.some((combination) => combination.result === BetResultType.WINNER);
    const has_void = combinations.some((combination) => combination.result === BetResultType.VOID);

    if (has_winner) {
      return BetResultType.WINNER;
    }

    if (has_void) {
      return BetResultType.PARTIAL;
    }

    return BetResultType.LOSER;
  };

  getCombinationsResultType = (combinations: ResultCombination[]): BetResultType => {
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

    if (has_winner) {
      return BetResultType.WINNER;
    }

    if (has_void) {
      return BetResultType.PARTIAL;
    }

    return BetResultType.LOSER;
  };

  getMainResultType = (combinations: ResultMainBet[]): BetResultType => {
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

    if (has_winner) {
      return BetResultType.WINNER;
    }

    if (has_void) {
      return BetResultType.PARTIAL;
    }

    return BetResultType.LOSER;
  };
}

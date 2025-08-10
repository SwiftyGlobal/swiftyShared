import { BetCalculatorHelper } from './bet-calculator.helper';
import type {
  BetSettings,
  PlacedBetSelection,
  ResultMainBet,
  Selection,
  ResultCombination,
  BetResult,
} from '../common/dto/PlacedBet';
import { BetOddType } from '../common/constants/betOddType';
import type { BetOdds } from '../common/dto/betOdd';
import { BetSlipType } from '../common/constants/betSlipType';
import { BetResultType } from '../common/constants/betResultType';

export class BetCalculator {
  stake: number = 0;

  total_stake: number = 0;

  stake_factor: number = 1;

  bets: PlacedBetSelection[] = [];

  selections: Selection[] = [];

  bet_type: BetSlipType = BetSlipType.SINGLE;

  bog_applicable: boolean = false;

  bog_max_payout: number = 0;

  max_payout: number = 0;

  free_bet_amount: number = 0;

  payout: number = 0;

  bog_amount_won: number = 0;

  bog_odd: number = 0;

  profit: number = 0;

  calculatorHelper: BetCalculatorHelper = new BetCalculatorHelper();

  reset = () => {
    this.stake = 0;
    this.total_stake = 0;
    this.stake_factor = 1;
    this.bets = [];
    this.selections = [];
    this.bet_type = BetSlipType.SINGLE;
    this.bog_applicable = false;
    this.bog_max_payout = 0;
    this.bog_amount_won = 0;
    this.bog_odd = 0;
    this.profit = 0;
    this.max_payout = 0;
    this.free_bet_amount = 0;
    this.payout = 0;
  };

  processBet = (betSettings: BetSettings): BetResult => {
    this.reset();

    const {
      stake,
      total_stake,
      max_payout,
      bog_max_payout,
      bets,
      selections,
      bet_type,
      free_bet_amount,
      bog_applicable,
    } = betSettings;
    this.stake = +stake;
    this.total_stake = +total_stake;
    this.max_payout = +max_payout || 0;
    this.bog_max_payout = +bog_max_payout || 0;
    this.bets = bets;
    this.selections = selections;
    this.bet_type = bet_type;
    this.free_bet_amount = +free_bet_amount || 0;
    this.bog_applicable = bog_applicable || false;

    let result: ResultMainBet | null = {
      stake: 0,
      payout: 0,
      win_profit: 0,
      place_profit: 0,
      result_type: BetResultType.OPEN,
      singles: [],
      combinations: [],
      accumulator_profit: 0,
    };

    if (this.bets.length === 1) {
      result = this.processSingleBet(this.bets[0]);
    } else if (this.bet_type === BetSlipType.DOUBLE) {
      result = this.processDoubles(this.bets);
    } else if (this.bet_type === BetSlipType.TREBLE) {
      result = this.processTrebles(this.bets);
    } else if (this.bet_type === BetSlipType.TRIXIE) {
      // TODO: Implement TriXie
    } else if (this.bet_type === BetSlipType.PATENT) {
      result = this.processPatentBet(this.bets);
    } else if (this.bet_type === BetSlipType.YANKEE) {
      result = this.processYankeeBet(this.bets);
    } else if (this.bet_type === BetSlipType.CANADIAN) {
      result = this.processCanadianBet(this.bets);
    } else if (this.bet_type === BetSlipType.HEINZ) {
      result = this.processHeinzBet(this.bets);
    } else if (this.bet_type === BetSlipType.SUPER_HEINZ) {
      result = this.processSuperHeinzBet(this.bets);
    } else if (this.bet_type === BetSlipType.GOLIATH) {
      result = this.processGoliathBet(this.bets);
    }

    console.log('Result', JSON.stringify(result));

    const validatedPayout = this.calculatorHelper.validatePayout({
      win_profit: result?.win_profit || 0,
      place_profit: result?.place_profit || 0,
      bog_amount_won: this.bog_amount_won,
      max_payout: this.max_payout,
      max_bog_payout: this.bog_max_payout,
      free_bet_amount: this.free_bet_amount,
      stake: result?.stake || 0,
    });

    console.log('Validated Payout', JSON.stringify(validatedPayout));

    return {
      calc: {
        win_profit: result?.win_profit || 0,
        place_profit: result?.place_profit || 0,
        bog_amount_won: this.bog_amount_won,
        max_payout: this.max_payout,
        max_bog_payout: this.bog_max_payout,
        free_bet_amount: this.free_bet_amount,
        stake: result?.stake || 0,
        bog_odd: this.bog_odd,
        profit: this.profit,
      },
      singles: result?.singles || [],
      combinations: result?.combinations || [],
      return_payout: this.calculatorHelper.roundToDecimalPlaces(validatedPayout.payout),
      return_stake: this.calculatorHelper.roundToDecimalPlaces(validatedPayout.stake),
      result_type: result?.result_type || BetResultType.OPEN,
      bog_amount_won: validatedPayout.bog_amount_won,
      accumulator_profit: result?.accumulator_profit || 0,
    };
  };

  processSingleBet = (selection: PlacedBetSelection): ResultMainBet => {
    let win_profit = 0;
    let place_profit = 0;
    let return_stake = 0;

    const odds = this.calculatorHelper.retrieveOdds(selection);

    const each_way_odds = this.calculatorHelper.retrieveEachWayOdds(odds, selection.ew_terms);

    if ((odds.main.numerator === 0 || odds.main.denominator === 0) && selection.result !== BetResultType.VOID) {
      this.profit = 0;
      this.payout = 0;
      return_stake = 0;
      return {
        stake: return_stake,
        payout: this.payout,
        result_type: selection.result,
        win_profit,
        place_profit,
        singles: [
          {
            stake: return_stake,
            win_profit,
            place_profit,
            profit: this.profit,
            bog_amount_won: this.bog_amount_won,
            bog_odd: this.bog_odd,
            win_odd: odds.main.odd_decimal,
            place_odd: each_way_odds?.main?.odd_decimal || 0,
            payout: this.payout,
            result_type: selection.result,
          },
        ],
        combinations: [],
        accumulator_profit: 0,
      };
    }

    if ([BetResultType.WINNER, BetResultType.PARTIAL].includes(selection.result)) {
      win_profit = this.calculatorHelper.calculateProfit(
        odds,
        this.stake,
        selection.is_starting_price ? BetOddType.SP : BetOddType.MAIN,
      );
      place_profit = this.calculatorHelper.calculateProfit(
        each_way_odds,
        this.stake,
        selection.is_starting_price ? BetOddType.SP : BetOddType.MAIN,
      );

      if (this.bog_applicable) {
        const bog_win_profit = this.calculatorHelper.calculateProfit(odds, this.stake, BetOddType.BOG);
        const bog_place_profit = this.calculatorHelper.calculateProfit(each_way_odds, this.stake, BetOddType.BOG);

        this.bog_amount_won = +bog_win_profit + +bog_place_profit - +win_profit - +place_profit;
        this.bog_odd = each_way_odds ? each_way_odds.bog.odd_decimal : odds.bog.odd_decimal;

        win_profit = +bog_win_profit;
        place_profit = +bog_place_profit;
      }

      this.profit = +win_profit + +place_profit;
      return_stake = this.stake + (selection.is_each_way ? this.stake : 0);
    } else if (selection.result === BetResultType.PLACED && selection.is_each_way) {
      place_profit = this.calculatorHelper.calculateProfit(
        selection.is_each_way ? each_way_odds : odds,
        this.stake,
        selection.is_starting_price ? BetOddType.SP : BetOddType.MAIN,
      );

      console.log('Placed single', { place_profit, odd: odds.main.odd_decimal });

      if (this.bog_applicable) {
        const bog_place_profit = this.calculatorHelper.calculateProfit(
          selection.is_each_way ? each_way_odds : odds,
          this.stake,
          BetOddType.BOG,
        );
        this.bog_amount_won = +place_profit - +bog_place_profit;
        this.bog_odd = selection.is_each_way ? each_way_odds?.bog.odd_decimal || 0 : odds.bog.odd_decimal;

        console.log('Placed single BOG', { place_profit, odd: this.bog_odd, bog_amount_won: this.bog_amount_won });
      }

      this.profit = +place_profit;
      return_stake = this.stake;
    } else if (selection.result === BetResultType.VOID) {
      win_profit = 0;
      place_profit = 0;
      return_stake = this.stake;
      this.profit = 0;
      console.log('Void single', { return_stake, profit: this.profit });
    } else if (selection.result === BetResultType.LOSER) {
      return_stake = 0;
      win_profit = 0;
      place_profit = 0;
      this.profit = 0;
      console.log('Lost single', { return_stake, win_profit, place_profit });
    }

    if (selection.rule_4) {
      this.profit = this.calculatorHelper.calculateRule4(this.profit, selection.rule_4);
      console.log('Rule 4', { profit: this.profit });
    }

    if (selection.partial_win_percent) {
      this.profit = this.calculatorHelper.calculatePartialWinPercent(this.profit, selection.partial_win_percent);
      console.log('Partial Win Percent', { profit: this.profit });
    }

    this.payout = +this.profit + +return_stake;

    console.log(
      'Single',
      JSON.stringify({
        return_stake,
        win_profit: +win_profit,
        place_profit: +place_profit,
        bog_amount_won: this.bog_amount_won,
      }),
    );

    return {
      stake: return_stake,
      payout: this.payout,
      result_type: selection.result,
      win_profit,
      place_profit,
      singles: [
        {
          stake: return_stake,
          win_profit,
          place_profit,
          profit: this.profit,
          bog_amount_won: this.bog_amount_won,
          bog_odd: this.bog_odd,
          win_odd: odds.main.odd_decimal,
          place_odd: each_way_odds?.main?.odd_decimal || 0,
          payout: this.payout,
          result_type: selection.result,
        },
      ],
      combinations: [],
      accumulator_profit: 0,
    };
  };

  processDoubleBet = (first_selection: PlacedBetSelection, second_selection: PlacedBetSelection): ResultMainBet => {
    let win_odd: BetOdds = {
      main: { numerator: 0, denominator: 0, odd_decimal: 0 },
      sp: { numerator: 0, denominator: 0, odd_decimal: 0 },
      bog: { numerator: 0, denominator: 0, odd_decimal: 0 },
    };
    let place_odd: BetOdds = {
      main: { numerator: 0, denominator: 0, odd_decimal: 0 },
      sp: { numerator: 0, denominator: 0, odd_decimal: 0 },
      bog: { numerator: 0, denominator: 0, odd_decimal: 0 },
    };
    let return_stake = this.stake;

    const return_result: BetResultType = this.generateDoubleResultType(first_selection, second_selection);

    // objects of odds
    const first_odds = this.calculatorHelper.retrieveOdds(first_selection);
    const second_odds = this.calculatorHelper.retrieveOdds(second_selection);

    const first_each_way_odds = this.calculatorHelper.retrieveEachWayOdds(first_odds, first_selection.ew_terms);
    const second_each_way_odds = this.calculatorHelper.retrieveEachWayOdds(second_odds, second_selection.ew_terms);

    const { win_odd: first_win_odd, place_odd: first_place_odd } = this.calculatorHelper.getSingleResultOdds(
      first_selection,
      first_odds,
      first_each_way_odds,
      BetOddType.MAIN,
    );
    const { win_odd: second_win_odd, place_odd: second_place_odd } = this.calculatorHelper.getSingleResultOdds(
      second_selection,
      second_odds,
      second_each_way_odds,
      BetOddType.MAIN,
    );
    console.log('Double', JSON.stringify({ first_win_odd, first_place_odd, second_win_odd, second_place_odd }));

    // add stake odd to the numerator (+1)
    win_odd = this.calculatorHelper.getCombinationOdds([first_win_odd, second_win_odd]);
    place_odd = this.calculatorHelper.getCombinationOdds([first_place_odd, second_place_odd]);

    console.log('Double Combination', JSON.stringify({ win_odd, place_odd }));

    if (this.bog_applicable) {
      const { win_odd: first_win_bog_odd, place_odd: first_place_bog_odd } = this.calculatorHelper.getSingleResultOdds(
        first_selection,
        first_odds,
        first_each_way_odds,
        BetOddType.BOG,
      );
      const { win_odd: second_win_bog_odd, place_odd: second_place_bog_odd } =
        this.calculatorHelper.getSingleResultOdds(second_selection, second_odds, second_each_way_odds, BetOddType.BOG);
      console.log(
        'Double BOG',
        JSON.stringify({ first_win_bog_odd, first_place_bog_odd, second_win_bog_odd, second_place_bog_odd }),
      );
    }

    let win_profit = this.calculatorHelper.calculateProfit(win_odd, this.stake, BetOddType.MAIN);
    let place_profit = this.calculatorHelper.calculateProfit(place_odd, this.stake, BetOddType.MAIN);

    console.log('Double calculated odds', JSON.stringify({ win_odd, place_odd, win_profit }));

    if (this.bog_applicable) {
      const bog_win_profit = this.calculatorHelper.calculateProfit(win_odd, this.stake, BetOddType.BOG);
      const bog_place_profit = this.calculatorHelper.calculateProfit(place_odd, this.stake, BetOddType.BOG);

      this.bog_amount_won = +bog_win_profit + +bog_place_profit - +win_profit - +place_profit;
      this.bog_odd = win_odd.bog.odd_decimal * (place_odd.bog.odd_decimal > 0 ? place_odd.bog.odd_decimal : 1);

      win_profit = +bog_win_profit;
      place_profit = +bog_place_profit;
    }

    // this.profit = +win_profit + +place_profit;

    // return_stake = this.profit > 0 ? return_stake : 0;

    const main_result_type = this.calculatorHelper.getBetResultType([first_selection, second_selection]);

    if (main_result_type === BetResultType.VOID) {
      win_profit = 0;
      place_profit = 0;
      return_stake = this.stake;
    } else if (main_result_type === BetResultType.LOSER) {
      win_profit = 0;
      place_profit = 0;
      return_stake = 0;
    }
    this.profit = +win_profit + +place_profit;
    this.payout = this.profit + return_stake;

    console.log(
      'Double Result - ' + main_result_type,
      JSON.stringify({
        win_profit,
        place_profit,
        bog_amount_won: this.bog_amount_won,
        bog_odd: this.bog_odd,
        win_odd,
        place_odd,
        main_result_type,
      }),
    );

    console.log({
      first_selection,
      second_selection,
      main_result_type,
      win_profit,
      place_profit,
      profit: this.profit,
      payout: this.payout,
      return_stake,
    });

    return {
      stake: return_stake,
      payout: this.payout,
      result_type: main_result_type,
      win_profit,
      place_profit,
      combinations: [
        {
          stake: return_stake,
          win_profit,
          place_profit,
          profit: this.profit,
          bog_amount_won: this.bog_amount_won,
          bog_odd: this.bog_odd,
          win_odd: win_odd.main.odd_decimal,
          place_odd: place_odd.main.odd_decimal,
          payout: this.payout,
          result_type: return_result,
          bet_type: BetSlipType.DOUBLE,
        },
      ],
      singles: [],
      accumulator_profit: 0,
    };
  };

  processDoubles = (selections: PlacedBetSelection[]): ResultMainBet => {
    let win_profit = 0;
    let place_profit = 0;
    let return_stake = 0;
    // let win_odd: number = 1;
    // let place_odd: number = 1;

    const results: ResultCombination[] = [];

    const combinations = this.generateCombinations(selections, BetSlipType.DOUBLE);

    combinations.forEach((combination: PlacedBetSelection[]) => {
      const double_result = this.processDoubleBet(combination[0], combination[1]);
      results.push(...double_result.combinations);
      win_profit += double_result.combinations
        .map((result: ResultCombination) => result.win_profit)
        .reduce((acc, curr) => acc + curr, 0);
      place_profit += double_result.combinations
        .map((result: ResultCombination) => result.place_profit)
        .reduce((acc, curr) => acc + curr, 0);
      return_stake += double_result.combinations
        .map((result: ResultCombination) => result.stake)
        .reduce((acc, curr) => acc + curr, 0);
    });

    console.log('Doubles Results', JSON.stringify(results));

    this.profit = results.map((result) => result.profit).reduce((acc, curr) => acc + curr, 0);
    this.payout = results.map((result) => result.payout).reduce((acc, curr) => acc + curr, 0);

    const main_result_type = this.calculatorHelper.getCombinationsResultType(results);

    console.log(
      'Doubles Result',
      JSON.stringify({
        win_profit,
        place_profit,
        bog_amount_won: this.bog_amount_won,
        bog_odd: this.bog_odd,
        main_result_type,
      }),
    );

    return {
      stake: return_stake,
      payout: this.payout,
      result_type: main_result_type,
      win_profit,
      place_profit,
      combinations: results,
      singles: [],
      accumulator_profit: 0,
    };
  };

  processTrebleBet = (
    first_selection: PlacedBetSelection,
    second_selection: PlacedBetSelection,
    third_selection: PlacedBetSelection,
  ): ResultMainBet => {
    let win_odds: BetOdds = {
      main: { numerator: 0, denominator: 0, odd_decimal: 0 },
      sp: { numerator: 0, denominator: 0, odd_decimal: 0 },
      bog: { numerator: 0, denominator: 0, odd_decimal: 0 },
    };
    let place_odds: BetOdds = {
      main: { numerator: 0, denominator: 0, odd_decimal: 0 },
      sp: { numerator: 0, denominator: 0, odd_decimal: 0 },
      bog: { numerator: 0, denominator: 0, odd_decimal: 0 },
    };
    let win_bog_odds: BetOdds = {
      main: { numerator: 0, denominator: 0, odd_decimal: 0 },
      sp: { numerator: 0, denominator: 0, odd_decimal: 0 },
      bog: { numerator: 0, denominator: 0, odd_decimal: 0 },
    };
    let place_bog_odds: BetOdds = {
      main: { numerator: 0, denominator: 0, odd_decimal: 0 },
      sp: { numerator: 0, denominator: 0, odd_decimal: 0 },
      bog: { numerator: 0, denominator: 0, odd_decimal: 0 },
    };

    const first_odds = this.calculatorHelper.retrieveOdds(first_selection);
    const second_odds = this.calculatorHelper.retrieveOdds(second_selection);
    const third_odds = this.calculatorHelper.retrieveOdds(third_selection);

    const first_each_way_odds = this.calculatorHelper.retrieveEachWayOdds(first_odds, first_selection.ew_terms);
    const second_each_way_odds = this.calculatorHelper.retrieveEachWayOdds(second_odds, second_selection.ew_terms);
    const third_each_way_odds = this.calculatorHelper.retrieveEachWayOdds(third_odds, third_selection.ew_terms);

    let return_stake = this.stake;

    const {
      win_odd: first_win_odd,
      place_odd: first_place_odd,
      result_type: first_result_type,
    } = this.calculatorHelper.getSingleResultOdds(first_selection, first_odds, first_each_way_odds, BetOddType.MAIN);
    const {
      win_odd: second_win_odd,
      place_odd: second_place_odd,
      result_type: second_result_type,
    } = this.calculatorHelper.getSingleResultOdds(second_selection, second_odds, second_each_way_odds, BetOddType.MAIN);
    const {
      win_odd: third_win_odd,
      place_odd: third_place_odd,
      result_type: third_result_type,
    } = this.calculatorHelper.getSingleResultOdds(third_selection, third_odds, third_each_way_odds, BetOddType.MAIN);

    console.log(
      JSON.stringify({
        first_win_odd,
        second_win_odd,
        third_win_odd,
        first_result_type,
        second_result_type,
        third_result_type,
      }),
    );

    win_odds = this.calculatorHelper.getCombinationOdds([first_win_odd, second_win_odd, third_win_odd]);
    place_odds = this.calculatorHelper.getCombinationOdds([first_place_odd, second_place_odd, third_place_odd]);

    let win_profit = this.calculatorHelper.calculateProfit(win_odds, this.stake, BetOddType.MAIN);
    let place_profit = this.calculatorHelper.calculateProfit(place_odds, this.stake, BetOddType.MAIN);

    if (this.bog_applicable) {
      const { win_odd: first_win_bog_odd, place_odd: first_place_bog_odd } = this.calculatorHelper.getSingleResultOdds(
        first_selection,
        first_odds,
        first_each_way_odds,
        BetOddType.BOG,
      );
      const { win_odd: second_win_bog_odd, place_odd: second_place_bog_odd } =
        this.calculatorHelper.getSingleResultOdds(second_selection, second_odds, second_each_way_odds, BetOddType.BOG);
      const { win_odd: third_win_bog_odd, place_odd: third_place_bog_odd } = this.calculatorHelper.getSingleResultOdds(
        third_selection,
        third_odds,
        third_each_way_odds,
        BetOddType.BOG,
      );

      win_bog_odds = this.calculatorHelper.getCombinationOdds([
        first_win_bog_odd,
        second_win_bog_odd,
        third_win_bog_odd,
      ]);
      place_bog_odds = this.calculatorHelper.getCombinationOdds([
        first_place_bog_odd,
        second_place_bog_odd,
        third_place_bog_odd,
      ]);

      const bog_win_profit = this.calculatorHelper.calculateProfit(win_bog_odds, this.stake, BetOddType.BOG);
      const bog_place_profit = this.calculatorHelper.calculateProfit(place_bog_odds, this.stake, BetOddType.BOG);

      this.bog_amount_won = +bog_win_profit + +bog_place_profit - +win_profit - +place_profit;
      this.bog_odd =
        win_bog_odds.bog.odd_decimal * (place_bog_odds.bog.odd_decimal > 0 ? place_bog_odds.bog.odd_decimal : 1);

      win_profit = +bog_win_profit;
      place_profit = +bog_place_profit;
    }

    const selection_identifier = `${first_selection.odd_fractional}x${second_selection.odd_fractional}x${third_selection.odd_fractional}`;

    console.log(
      'Treble Result' + selection_identifier,
      JSON.stringify({
        win_profit,
        place_profit,
        bog_amount_won: this.bog_amount_won,
        bog_odd: this.bog_odd,
        win_odds,
        place_odds,
      }),
    );

    const result_type = this.calculatorHelper.getBetResultType([first_selection, second_selection, third_selection]);

    if (result_type === BetResultType.VOID) {
      win_profit = 0;
      place_profit = 0;
      return_stake = this.stake;
    } else if (result_type === BetResultType.LOSER) {
      win_profit = 0;
      place_profit = 0;
      return_stake = 0;
    }

    this.profit = +win_profit + +place_profit;
    this.payout = this.profit + return_stake;

    return {
      stake: return_stake,
      payout: this.payout,
      result_type,
      win_profit,
      place_profit,
      combinations: [
        {
          stake: return_stake,
          win_profit,
          place_profit,
          profit: this.profit,
          bog_amount_won: this.bog_amount_won,
          bog_odd: this.bog_odd,
          win_odd: win_odds.main.odd_decimal,
          place_odd: place_odds.main.odd_decimal,
          payout: this.payout,
          result_type,
          bet_type: BetSlipType.TREBLE,
        },
      ],
      singles: [],
      accumulator_profit: 0,
    };
  };

  processTrebles = (selections: PlacedBetSelection[]): ResultMainBet => {
    let win_profit = 0;
    let place_profit = 0;
    let return_stake = 0;
    // const win_odd: number = 1;
    // const place_odd: number = 1;

    const results: ResultCombination[] = [];

    const combinations = this.generateCombinations(selections, BetSlipType.TREBLE);

    combinations.forEach((combination) => {
      const treble_result = this.processTrebleBet(combination[0], combination[1], combination[2]);
      results.push(...treble_result.combinations);
      win_profit += treble_result.combinations
        .map((result: ResultCombination) => result.win_profit)
        .reduce((acc, curr) => acc + curr, 0);
      place_profit += treble_result.combinations
        .map((result: ResultCombination) => result.place_profit)
        .reduce((acc, curr) => acc + curr, 0);
      return_stake += treble_result.combinations
        .map((result: ResultCombination) => result.stake)
        .reduce((acc, curr) => acc + curr, 0);
    });

    console.log('Trebles Results', JSON.stringify(results));

    this.profit = results.map((result) => result.win_profit).reduce((acc, curr) => acc + curr, 0);
    this.payout = results.map((result) => result.payout).reduce((acc, curr) => acc + curr, 0);

    const main_result_type = this.calculatorHelper.getCombinationsResultType(results);

    console.log(
      'Trebles Result',
      JSON.stringify({
        win_profit,
        place_profit,
        bog_amount_won: this.bog_amount_won,
        bog_odd: this.bog_odd,
        main_result_type,
      }),
    );

    return {
      stake: return_stake,
      payout: this.payout,
      result_type: main_result_type,
      win_profit,
      place_profit,
      combinations: results,
      singles: [],
      accumulator_profit: 0,
    };
  };

  // 3 single, 3 double, 1 treble
  processPatentBet = (selections: PlacedBetSelection[]): ResultMainBet => {
    const singles = selections.map((selection) => this.processSingleBet(selection));
    const doubles = this.processDoubles(selections);
    const trebles = this.processTrebles(selections);

    const singles_payout = singles.map((single) => single.payout).reduce((acc, curr) => acc + curr, 0);
    const singles_stake = singles.map((single) => single.stake).reduce((acc, curr) => acc + curr, 0);
    const doubles_payout = doubles.payout;
    const doubles_stake = doubles.stake;
    const trebles_payout = trebles.payout;
    const trebles_stake = trebles.stake;

    const win_profit =
      singles.map((single) => single.win_profit).reduce((acc, curr) => acc + curr, 0) +
      doubles.win_profit +
      trebles.win_profit;
    const place_profit =
      singles.map((single) => single.place_profit).reduce((acc, curr) => acc + curr, 0) +
      doubles.place_profit +
      trebles.place_profit;

    const main_result_type = this.calculatorHelper.getMainResultType([doubles, trebles]);

    return {
      singles: singles.map((single) => single.singles).flat(),
      combinations: [...doubles.combinations, ...trebles.combinations],
      stake: singles_stake + doubles_stake + trebles_stake,
      payout: singles_payout + doubles_payout + trebles_payout,
      result_type: main_result_type,
      win_profit,
      place_profit,
      accumulator_profit: 0,
    };
  };

  // 4 selections
  // 4 single, 6 double, 4 treble, 1 accumulator - single result is exluded
  processYankeeBet = (selections: PlacedBetSelection[]): ResultMainBet => {
    const singles = selections.map((selection) => this.processSingleBet(selection));
    const doubles = this.processDoubles(selections);
    const trebles = this.processTrebles(selections);
    const accumulator = this.processAccumulatorBet(selections);

    const singles_payout = singles.map((single) => single.payout).reduce((acc, curr) => acc + curr, 0);

    const doubles_payout = doubles.payout;
    const doubles_stake = doubles.stake;
    const trebles_payout = trebles.payout;
    const trebles_stake = trebles.stake;
    const accumulator_payout = accumulator.payout;

    console.log('Yangke combination payouts', {
      singles_payout,
      doubles_payout,
      trebles_payout,
      accumulator_payout,
    });

    const win_profit = doubles.win_profit + trebles.win_profit + accumulator.win_profit;
    const place_profit = doubles.place_profit + trebles.place_profit + accumulator.place_profit;

    const main_result_type = this.calculatorHelper.getMainResultType([doubles, trebles]);

    return {
      singles: singles.map((single) => single.singles).flat(),
      combinations: [...doubles.combinations, ...trebles.combinations],
      stake: doubles_stake + trebles_stake + accumulator.stake,
      payout: doubles_payout + trebles_payout + accumulator_payout,
      result_type: main_result_type,
      win_profit,
      place_profit,
      accumulator_profit: accumulator_payout,
    };
  };

  // 5 single, 10 double, 10 treble, 5 fourfold, 1 accumulator
  processCanadianBet = (selections: PlacedBetSelection[]) => {
    const singles = selections.map((selection) => this.processSingleBet(selection));
    const doubles = this.processDoubles(selections);
    const trebles = this.processTrebles(selections);
    const folds = this.processFoldBet(selections, 4);
    const accumulator = this.processAccumulatorBet(selections);

    const doubles_payout = doubles.payout;
    const doubles_stake = doubles.stake;
    const trebles_payout = trebles.payout;
    const trebles_stake = trebles.stake;
    const folds_payout = folds.payout;
    const folds_stake = folds.stake;
    const accumulator_payout = accumulator.payout;
    const total_payout = this.calculatorHelper.roundToDecimalPlaces(
      doubles_payout + trebles_payout + folds_payout + accumulator_payout,
    );

    console.log('Canadian', JSON.stringify({ selections }));

    const main_result_type = this.calculatorHelper.getMainResultType([doubles, trebles, folds, accumulator]);

    return {
      singles: singles.map((single) => single.singles).flat(),
      combinations: [...doubles.combinations, ...trebles.combinations, ...folds.combinations],
      stake: doubles_stake + trebles_stake + folds_stake + accumulator.stake,
      payout: total_payout,
      result_type: main_result_type,
      win_profit: this.calculatorHelper.roundToDecimalPlaces(
        doubles.win_profit + trebles.win_profit + folds.win_profit + accumulator.win_profit,
      ),
      place_profit: this.calculatorHelper.roundToDecimalPlaces(
        doubles.place_profit + trebles.place_profit + folds.place_profit + accumulator.place_profit,
      ),
      accumulator_profit: accumulator_payout,
    };
  };

  // 6 single, 15 double, 20 treble, 15 fourfold, 6 fivefold, 1 accumulator
  processHeinzBet = (selections: PlacedBetSelection[]) => {
    const singles = selections.map((selection) => this.processSingleBet(selection));
    const doubles = this.processDoubles(selections);
    const trebles = this.processTrebles(selections);
    const accumulator = this.processAccumulatorBet(selections);

    const doubles_payout = doubles.payout;
    const doubles_stake = doubles.stake;
    const trebles_payout = trebles.payout;
    const trebles_stake = trebles.stake;
    const accumulator_payout = accumulator.payout;

    console.log('Heinz', JSON.stringify({ selections }));

    const main_result_type = this.calculatorHelper.getMainResultType([doubles, trebles, accumulator]);

    return {
      singles: singles.map((single) => single.singles).flat(),
      combinations: [...doubles.combinations, ...trebles.combinations],
      stake: doubles_stake + trebles_stake + accumulator.stake,
      payout: doubles_payout + trebles_payout + accumulator_payout,
      result_type: main_result_type,
      win_profit: doubles.win_profit + trebles.win_profit + accumulator.win_profit,
      place_profit: doubles.place_profit + trebles.place_profit + accumulator.place_profit,
      accumulator_profit: accumulator_payout,
    };
  };

  // 7 single, 21 double, 35 treble, 35 fourfold, 21 fivefold, 7 sixfold, 1 accumulator
  processSuperHeinzBet = (selections: PlacedBetSelection[]) => {
    // const win_profit = 0;
    // const place_profit = 0;
    // const return_stake = 0;

    console.log('Super Heinz', JSON.stringify({ selections }));

    return null;
  };

  //  8 single, 28 double, 56 treble, 70 fourfold, 56 fivefold, 28 sixfold, 8 sevenfold, 1 accumulator
  processGoliathBet = (selections: PlacedBetSelection[]) => {
    // const win_profit = 0;
    // const place_profit = 0;
    // const return_stake = 0;

    console.log('Goliath', JSON.stringify({ selections }));

    return null;
  };

  // 4 selections: 4 single, 6 double, 4 treble, 1 accumulator
  processLucky15Bet = (selections: PlacedBetSelection[]) => {
    // const win_profit = 0;
    // const place_profit = 0;
    // const return_stake = 0;

    console.log('Lucky 15', JSON.stringify({ selections }));

    return null;
  };

  // 5 selections: 5 single, 10 double, 10 treble, 5 fourfold, 1 accumulator
  processLucky31Bet = (selections: PlacedBetSelection[]) => {
    // const win_profit = 0;
    // const place_profit = 0;
    // const return_stake = 0;

    console.log('Lucky 31', JSON.stringify({ selections }));

    return null;
  };

  // 6 selections: 6 single, 15 double, 20 treble, 15 fourfold, 6 fivefold, 1 accumulator
  processLucky63Bet = (selections: PlacedBetSelection[]) => {
    // const win_profit = 0;
    // const place_profit = 0;
    // const return_stake = 0;

    console.log('Lucky 63', JSON.stringify({ selections }));

    return null;
  };

  // 4 selections: 4 single, 6 double, 4 treble, 1 accumulator
  // 5 selections: 5 single, 10 double, 10 treble, 5 fourfold, 1 accumulator
  // 6 selections: 6 single, 15 double, 20 treble, 15 fourfold, 6 fivefold, 1 accumulator
  // 7 selections: 7 single, 21 double, 35 treble, 35 fourfold, 21 fivefold, 7 sixfold, 1 accumulator
  // 8 selections: 8 single, 28 double, 56 treble, 70 fourfold, 56 fivefold, 28 sixfold, 8 sevenfold, 1 accumulator
  processAccumulatorBet = (selections: PlacedBetSelection[]): ResultMainBet => {
    const oddList: BetOdds[] = [];
    const eachWayOddList: BetOdds[] = [];

    for (const selection of selections) {
      const retrieved_odds = this.calculatorHelper.retrieveOdds(selection);
      const each_way_odds = this.calculatorHelper.retrieveEachWayOdds(retrieved_odds, selection.ew_terms);

      oddList.push(retrieved_odds);
      if (each_way_odds) {
        eachWayOddList.push(each_way_odds);
      }
    }

    const odds = this.calculatorHelper.getCombinationOdds(oddList);
    const eachWayOdds = this.calculatorHelper.getCombinationOdds(eachWayOddList);

    console.log('Accumulator', JSON.stringify({ selections, odds }));

    const win_profit = this.calculatorHelper.calculateProfit(odds, this.stake, BetOddType.MAIN);
    const place_profit = this.calculatorHelper.calculateProfit(eachWayOdds, this.stake, BetOddType.MAIN);

    const main_result_type = this.calculatorHelper.getBetResultType(selections);

    return {
      stake: this.stake,
      payout: win_profit + place_profit + this.stake,
      result_type: main_result_type,
      win_profit,
      place_profit,
      singles: [],
      combinations: [],
      accumulator_profit: 0,
    };
  };

  // combinations is of how many selections to be combined together
  processFoldBet = (selections: PlacedBetSelection[], combinationSize: number): ResultMainBet => {
    const foldCombinations = this.generateFoldCombinations(selections, combinationSize);
    const results: ResultCombination[] = [];

    // TODO: Implement fold bet processing logic
    console.log('Fold Bet', { selections, combinationSize, foldCombinations });

    foldCombinations.forEach((combination) => {
      const result: ResultMainBet = this.processAccumulatorBet(combination);

      results.push({
        payout: result.payout,
        win_profit: result.win_profit,
        place_profit: result.place_profit,
        profit: result.win_profit + result.place_profit,
        bog_amount_won: 0,
        bog_odd: 0,
        win_odd: 0,
        place_odd: 0,
        result_type: result.result_type,
        bet_type: BetSlipType.FOLD,
        stake: result.stake,
      });
    });

    return {
      stake: results.map((result) => result.stake).reduce((acc, curr) => acc + curr, 0),
      payout: results.map((result) => result.payout).reduce((acc, curr) => acc + curr, 0),
      result_type: BetResultType.OPEN,
      win_profit: results.map((result) => result.win_profit).reduce((acc, curr) => acc + curr, 0),
      place_profit: results.map((result) => result.place_profit).reduce((acc, curr) => acc + curr, 0),
      singles: [],
      combinations: results,
      accumulator_profit: 0,
    };
  };

  generateCombinations = (selections: PlacedBetSelection[], type: BetSlipType): PlacedBetSelection[][] => {
    let combinations: PlacedBetSelection[][] = [];

    switch (type) {
      case BetSlipType.DOUBLE:
        combinations = this.generateDoubleCombinations(selections);
        break;
      case BetSlipType.TREBLE:
        combinations = this.generateTrebleCombinations(selections);
        break;
    }

    return combinations;
  };

  generateDoubleCombinations = (selections: PlacedBetSelection[]): PlacedBetSelection[][] => {
    const combinations: PlacedBetSelection[][] = [];

    for (let i = 0; i < selections.length; i++) {
      for (let j = i + 1; j < selections.length; j++) {
        combinations.push([selections[i], selections[j]]);
      }
    }

    return combinations;
  };

  generateDoubleResultType = (
    first_selection: PlacedBetSelection,
    second_selection: PlacedBetSelection,
  ): BetResultType => {
    if (first_selection.result === BetResultType.VOID && second_selection.result === BetResultType.VOID) {
      return BetResultType.VOID;
    } else if (first_selection.result === BetResultType.LOSER || second_selection.result === BetResultType.LOSER) {
      return BetResultType.LOSER;
    } else if (first_selection.result === BetResultType.PLACED && second_selection.result === BetResultType.PLACED) {
      return BetResultType.PLACED;
    } else if (first_selection.result === BetResultType.WINNER && second_selection.result === BetResultType.WINNER) {
      return BetResultType.WINNER;
    } else if (first_selection.result === BetResultType.PARTIAL && second_selection.result === BetResultType.PARTIAL) {
      return BetResultType.PARTIAL;
    } else if (first_selection.result === BetResultType.VOID && second_selection.result != BetResultType.VOID) {
      return second_selection.result;
    } else if (first_selection.result != BetResultType.VOID && second_selection.result === BetResultType.VOID) {
      return first_selection.result;
    } else if (
      (first_selection.result === BetResultType.WINNER && second_selection.result === BetResultType.PLACED) ||
      (first_selection.result === BetResultType.PLACED && second_selection.result === BetResultType.WINNER)
    ) {
      return BetResultType.PARTIAL;
    }

    return BetResultType.OPEN;
  };

  generateDoubleCombinationResult = (first_result: BetResultType, second_result: BetResultType): BetResultType => {
    if (first_result === BetResultType.VOID && second_result === BetResultType.VOID) {
      return BetResultType.VOID;
    } else if (first_result === BetResultType.LOSER && second_result === BetResultType.LOSER) {
      return BetResultType.LOSER;
    } else if (first_result === BetResultType.PLACED && second_result === BetResultType.PLACED) {
      return BetResultType.PLACED;
    } else if (first_result === BetResultType.VOID && second_result != BetResultType.VOID) {
      return second_result;
    } else if (first_result != BetResultType.VOID && second_result === BetResultType.VOID) {
      return first_result;
    } else if (first_result === BetResultType.WINNER && second_result === BetResultType.WINNER) {
      return BetResultType.WINNER;
    } else if (first_result === BetResultType.PARTIAL && second_result === BetResultType.PARTIAL) {
      return BetResultType.PARTIAL;
    } else if (first_result === BetResultType.PARTIAL && second_result === BetResultType.WINNER) {
      return BetResultType.PARTIAL;
    } else if (first_result === BetResultType.PARTIAL && second_result === BetResultType.LOSER) {
      return BetResultType.PARTIAL;
    }

    return BetResultType.OPEN;
  };

  generateTrebleCombinations = (selections: PlacedBetSelection[]) => {
    const combinations: PlacedBetSelection[][] = [];

    for (let i = 0; i < selections.length; i++) {
      for (let j = i + 1; j < selections.length; j++) {
        for (let k = j + 1; k < selections.length; k++) {
          combinations.push([selections[i], selections[j], selections[k]]);
        }
      }
    }

    return combinations;
  };

  generateFoldCombinations = (selections: PlacedBetSelection[], combinationSize: number): PlacedBetSelection[][] => {
    const result: PlacedBetSelection[][] = [];

    // Funksion ndihmës për të gjeneruar kombinime
    const generateCombinations = (
      arr: PlacedBetSelection[],
      size: number,
      start: number = 0,
      current: PlacedBetSelection[] = [],
    ) => {
      if (current.length === size) {
        result.push([...current]);
        return;
      }

      for (let i = start; i < arr.length; i++) {
        current.push(arr[i]);
        generateCombinations(arr, size, i + 1, current);
        current.pop();
      }
    };

    generateCombinations(selections, combinationSize);
    return result;
  };
}

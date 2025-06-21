import { BetCalculatorHelper } from './bet-calculator.helper';
import type { BetSettings, PlacedBetSelection, ResultBet, Selection } from '../common/dto/PlacedBet';
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

  processBet = (betSettings: BetSettings) => {
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

    let result: ResultBet | null = {
      return_stake: 0,
      win_profit: 0,
      place_profit: 0,
      profit: 0,
      bog_amount_won: 0,
      bog_odd: 0,
      win_odd: 0,
      place_odd: 0,
    };

    if (this.bets.length === 1) {
      result = this.processSingleBet(this.bets[0]);
    } else if (this.bet_type === BetSlipType.DOUBLE) {
      result = this.processDoubles(this.bets);
    } else if (this.bet_type === BetSlipType.TREBLE) {
      result = this.processTrebles(this.bets);
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

    console.log('Result', result);

    const validatedPayout = this.calculatorHelper.validatePayout({
      win_profit: result?.win_profit || 0,
      place_profit: result?.place_profit || 0,
      bog_amount_won: this.bog_amount_won,
      max_payout: this.max_payout,
      max_bog_payout: this.bog_max_payout,
      free_bet_amount: this.free_bet_amount,
      stake: result?.return_stake || 0,
    });

    console.log('Validated Payout', validatedPayout);

    return {
      calc: {
        win_profit: result?.win_profit || 0,
        place_profit: result?.place_profit || 0,
        bog_amount_won: this.bog_amount_won,
        max_payout: this.max_payout,
        max_bog_payout: this.bog_max_payout,
        free_bet_amount: this.free_bet_amount,
        stake: result?.return_stake || 0,
        bog_odd: result?.bog_odd || 0,
        profit: result?.profit || 0,
      },
      return_payout: validatedPayout.payout,
      return_stake: validatedPayout.stake,
      bog_amount_won: validatedPayout.bog_amount_won,
    };
  };

  processSingleBet = (selection: PlacedBetSelection): ResultBet => {
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
        return_stake,
        win_profit,
        place_profit,
        profit: this.profit,
        bog_amount_won: this.bog_amount_won,
        bog_odd: this.bog_odd,
        win_odd: odds.main.odd_decimal,
        place_odd: each_way_odds?.main?.odd_decimal || 0,
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
      this.profit = 0;
      return_stake = this.stake;
      console.log('Void single', { return_stake });
    } else if (selection.result === BetResultType.LOSER) {
      return_stake = 0;
      console.log('Lost single', { return_stake });
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

    console.log('Single', {
      return_stake,
      win_profit: +win_profit,
      place_profit: +place_profit,
      bog_amount_won: this.bog_amount_won,
    });

    return {
      return_stake,
      win_profit: +win_profit,
      place_profit: +place_profit,
      profit: this.profit,
      bog_amount_won: this.bog_amount_won,
      bog_odd: this.bog_odd,
      win_odd: odds.main.odd_decimal,
      place_odd: each_way_odds?.main?.odd_decimal || 0,
    };
  };

  processDoubleBet = (first_selection: PlacedBetSelection, second_selection: PlacedBetSelection): ResultBet => {
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
    console.log('Double', { first_win_odd, first_place_odd, second_win_odd, second_place_odd });

    // add stake odd to the numerator (+1)
    win_odd = this.calculatorHelper.getCombinationOdds([first_win_odd, second_win_odd]);
    place_odd = this.calculatorHelper.getCombinationOdds([first_place_odd, second_place_odd]);

    console.log('Double Combination', { win_odd, place_odd });

    if (this.bog_applicable) {
      const { win_odd: first_win_bog_odd, place_odd: first_place_bog_odd } = this.calculatorHelper.getSingleResultOdds(
        first_selection,
        first_odds,
        first_each_way_odds,
        BetOddType.BOG,
      );
      const { win_odd: second_win_bog_odd, place_odd: second_place_bog_odd } =
        this.calculatorHelper.getSingleResultOdds(second_selection, second_odds, second_each_way_odds, BetOddType.BOG);
      console.log('Double BOG', { first_win_bog_odd, first_place_bog_odd, second_win_bog_odd, second_place_bog_odd });
    }

    let win_profit = this.calculatorHelper.calculateProfit(win_odd, this.stake, BetOddType.MAIN);
    let place_profit = this.calculatorHelper.calculateProfit(place_odd, this.stake, BetOddType.MAIN);

    console.log('Double calculated odds', { win_odd, place_odd, win_profit });

    if (this.bog_applicable) {
      const bog_win_profit = this.calculatorHelper.calculateProfit(win_odd, this.stake, BetOddType.BOG);
      const bog_place_profit = this.calculatorHelper.calculateProfit(place_odd, this.stake, BetOddType.BOG);

      this.bog_amount_won = +bog_win_profit + +bog_place_profit - +win_profit - +place_profit;
      this.bog_odd = win_odd.bog.odd_decimal * (place_odd.bog.odd_decimal > 0 ? place_odd.bog.odd_decimal : 1);

      win_profit = +bog_win_profit;
      place_profit = +bog_place_profit;
    }

    this.profit = +win_profit + +place_profit;
    this.payout = +this.profit + +this.stake;

    console.log('Double Result', {
      win_profit,
      place_profit,
      bog_amount_won: this.bog_amount_won,
      bog_odd: this.bog_odd,
      win_odd,
      place_odd,
    });

    return {
      win_profit,
      place_profit,
      profit: this.profit,
      bog_amount_won: this.bog_amount_won,
      bog_odd: this.bog_odd,
      return_stake: this.stake,
      win_odd: win_odd.main.odd_decimal,
      place_odd: place_odd.main.odd_decimal,
    };
  };

  processDoubles = (selections: PlacedBetSelection[]): ResultBet => {
    let win_profit = 0;
    let place_profit = 0;
    let return_stake = 0;
    let win_odd: number = 1;
    let place_odd: number = 1;

    const results: ResultBet[] = [];

    const combinations = this.generateCombinations(selections, BetSlipType.DOUBLE);

    combinations.forEach((combination: PlacedBetSelection[]) => {
      const result = this.processDoubleBet(combination[0], combination[1]);
      results.push(result);
      win_profit += result.win_profit;
      place_profit += result.place_profit;
      return_stake += result.return_stake;
      win_odd *= result.win_odd;
      place_odd *= result.place_odd;
    });

    console.log('Doubles Results', JSON.stringify(results));

    this.profit = +win_profit + +place_profit;
    this.payout = +this.profit + +this.total_stake;

    console.log('Doubles Result', {
      win_profit,
      place_profit,
      bog_amount_won: this.bog_amount_won,
      bog_odd: this.bog_odd,
    });

    return {
      win_profit,
      place_profit,
      profit: this.profit,
      bog_amount_won: this.bog_amount_won,
      bog_odd: this.bog_odd,
      return_stake,
      win_odd,
      place_odd,
    };
  };

  processTrebleBet = (
    first_selection: PlacedBetSelection,
    second_selection: PlacedBetSelection,
    third_selection: PlacedBetSelection,
  ): ResultBet => {
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
    const { win_odd: third_win_odd, place_odd: third_place_odd } = this.calculatorHelper.getSingleResultOdds(
      third_selection,
      third_odds,
      third_each_way_odds,
      BetOddType.MAIN,
    );

    console.log({ first_win_odd, second_win_odd, third_win_odd });

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

    this.profit = +win_profit + +place_profit;
    this.payout = +this.profit + +this.stake;

    const selection_identifier = `${first_selection.odd_fractional}x${second_selection.odd_fractional}x${third_selection.odd_fractional}`;

    console.log('Treble Result' + selection_identifier, {
      win_profit,
      place_profit,
      bog_amount_won: this.bog_amount_won,
      bog_odd: this.bog_odd,
      win_odds,
      place_odds,
    });

    return {
      win_profit,
      place_profit,
      profit: this.profit,
      bog_amount_won: this.bog_amount_won,
      bog_odd: this.bog_odd,
      return_stake: this.stake,
      win_odd: win_odds.main.odd_decimal,
      place_odd: place_odds.main.odd_decimal,
    };
  };

  processTrebles = (selections: PlacedBetSelection[]): ResultBet => {
    let win_profit = 0;
    let place_profit = 0;
    let return_stake = 0;
    let win_odd: number = 1;
    let place_odd: number = 1;

    const results: ResultBet[] = [];

    const combinations = this.generateCombinations(selections, BetSlipType.TREBLE);

    combinations.forEach((combination) => {
      const result = this.processTrebleBet(combination[0], combination[1], combination[2]);
      results.push(result);
      win_profit += result.win_profit;
      place_profit += result.place_profit;
      return_stake += result.return_stake;
      win_odd *= result.win_odd;
      place_odd *= result.place_odd;
    });

    console.log('Trebles Results', JSON.stringify(results));

    this.profit = +win_profit + +place_profit;
    this.payout = +this.profit + +this.total_stake;

    console.log('Trebles Result', {
      win_profit,
      place_profit,
      bog_amount_won: this.bog_amount_won,
      bog_odd: this.bog_odd,
    });

    return {
      win_profit,
      place_profit,
      profit: this.profit,
      bog_amount_won: this.bog_amount_won,
      bog_odd: this.bog_odd,
      return_stake,
      win_odd,
      place_odd,
    };
  };

  // 3 single, 3 double, 1 treble
  processPatentBet = (selections: PlacedBetSelection[]) => {
    // const win_profit = 0;
    // const place_profit = 0;
    // const return_stake = 0;

    console.log('Patent', { selections });

    return null;
  };

  // 4 single, 6 double, 4 treble, 1 accumulator
  processYankeeBet = (selections: PlacedBetSelection[]) => {
    // const win_profit = 0;
    // const place_profit = 0;
    // const return_stake = 0;

    console.log('Yankee', { selections });

    return null;
  };

  // 5 single, 10 double, 10 treble, 5 fourfold, 1 accumulator
  processCanadianBet = (selections: PlacedBetSelection[]) => {
    // const win_profit = 0;
    // const place_profit = 0;
    // const return_stake = 0;

    console.log('Canadian', { selections });

    return null;
  };

  // 6 single, 15 double, 20 treble, 15 fourfold, 6 fivefold, 1 accumulator
  processHeinzBet = (selections: PlacedBetSelection[]) => {
    // const win_profit = 0;
    // const place_profit = 0;
    // const return_stake = 0;

    console.log('Heinz', { selections });

    return null;
  };

  // 7 single, 21 double, 35 treble, 35 fourfold, 21 fivefold, 7 sixfold, 1 accumulator
  processSuperHeinzBet = (selections: PlacedBetSelection[]) => {
    // const win_profit = 0;
    // const place_profit = 0;
    // const return_stake = 0;

    console.log('Super Heinz', { selections });

    return null;
  };

  //  8 single, 28 double, 56 treble, 70 fourfold, 56 fivefold, 28 sixfold, 8 sevenfold, 1 accumulator
  processGoliathBet = (selections: PlacedBetSelection[]) => {
    // const win_profit = 0;
    // const place_profit = 0;
    // const return_stake = 0;

    console.log('Goliath', { selections });

    return null;
  };

  // 4 selections: 4 single, 6 double, 4 treble, 1 accumulator
  processLucky15Bet = (selections: PlacedBetSelection[]) => {
    // const win_profit = 0;
    // const place_profit = 0;
    // const return_stake = 0;

    console.log('Lucky 15', { selections });

    return null;
  };

  // 5 selections: 5 single, 10 double, 10 treble, 5 fourfold, 1 accumulator
  processLucky31Bet = (selections: PlacedBetSelection[]) => {
    // const win_profit = 0;
    // const place_profit = 0;
    // const return_stake = 0;

    console.log('Lucky 31', { selections });

    return null;
  };

  // 6 selections: 6 single, 15 double, 20 treble, 15 fourfold, 6 fivefold, 1 accumulator
  processLucky63Bet = (selections: PlacedBetSelection[]) => {
    // const win_profit = 0;
    // const place_profit = 0;
    // const return_stake = 0;

    console.log('Lucky 63', { selections });

    return null;
  };

  // 4 selections: 4 single, 6 double, 4 treble, 1 accumulator
  // 5 selections: 5 single, 10 double, 10 treble, 5 fourfold, 1 accumulator
  // 6 selections: 6 single, 15 double, 20 treble, 15 fourfold, 6 fivefold, 1 accumulator
  // 7 selections: 7 single, 21 double, 35 treble, 35 fourfold, 21 fivefold, 7 sixfold, 1 accumulator
  // 8 selections: 8 single, 28 double, 56 treble, 70 fourfold, 56 fivefold, 28 sixfold, 8 sevenfold, 1 accumulator
  processAccumulatorBet = (selections: PlacedBetSelection[]) => {
    // const win_profit = 0;
    // const place_profit = 0;
    // const return_stake = 0;

    console.log('Accumulator', { selections });

    return null;
  };

  generateCombinations = (selections: PlacedBetSelection[], type: BetSlipType): PlacedBetSelection[][] => {
    let combinations: PlacedBetSelection[][] = [];

    switch (type) {
      case BetSlipType.DOUBLE:
        combinations = this.generateDoubleCombinations(selections);
        break;
      case BetSlipType.TREBLE:
        combinations = this.generateTrebleCombinations(selections);
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
}

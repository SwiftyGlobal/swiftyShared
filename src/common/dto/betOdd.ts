export interface BetOdd {
  numerator: number;
  denominator: number;
  odd_decimal: number;
}

export interface BetOdds {
  main: BetOdd;
  sp: BetOdd;
  bog: BetOdd;
}

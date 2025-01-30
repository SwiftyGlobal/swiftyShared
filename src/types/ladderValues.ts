/**
 * @description - The ladder value to be used for the calculation of the boosted price. E.g. ladder+1, ladder-8, ladder+8, ladder+5, -1 etc...
 */
export type LadderValues = '-1' | `ladder${'+' | '-'}${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

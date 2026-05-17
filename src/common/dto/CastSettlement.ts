/**
 * One winning combination for a tote-style cast bet (forecast / tricast).
 * On a dead heat a race produces multiple WinningCombo entries with different
 * selectionIds and different dividends — settlement must pay each matching combo.
 *
 * selectionIds is provider-ordered (1st-place runner first, then 2nd, then 3rd
 * for tricast). Length is 2 for forecast/exacta, 3 for tricast/trifecta.
 * dividend is FX-converted to the bet's currency at the point of resolution.
 */
export interface WinningCombo {
  selectionIds: string[];
  dividend: number;
}

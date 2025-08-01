export enum BetSlipType {
  SINGLE = 'bet_slip_single',
  DOUBLE = 'bet_slip_place_double',
  TREBLE = 'bet_slip_place_treble',
  TRIXIE = 'bet_slip_place_trixie',
  PATENT = 'bet_slip_place_patent',
  YANKEE = 'bet_slip_place_yankee',
  LUCKY_15 = 'bet_slip_place_lucky15',
  CANADIAN = 'bet_slip_place_canadian',
  LUCKY_31 = 'bet_slip_place_lucky31',
  HEINZ = 'bet_slip_place_heinz',
  LUCKY_63 = 'bet_slip_place_lucky63',
  SUPER_HEINZ = 'bet_slip_place_superheinz',
  GOLIATH = 'bet_slip_place_goliath',
  SUPER_GOLIATH = 'bet_slip_place_supergoliath',
  EMPTY_LEG = 'empty_leg',
  UNNAMED_FAVORITE = 'bet_slip_place_unnamed_favorite',
  FORECAST_SINGLE = 'bet_slip_place_forecast_single',
  FORECAST_REVERSE = 'bet_slip_place_forecast_reverse',
  EXACTA = 'bet_slip_place_exacta',
  TRIFECTA = 'bet_slip_place_trifecta',
  SWINGER = 'bet_slip_place_swinger',
  FOLD = 'bet_slip_place_fold',
}

export enum CastType {
  FORECAST_SINGLE = 'forecast_single',
  FORECAST_REVERSE = 'forecast_reverse',
  FORECAST_COMBINATION = 'forecast_combination',
  TRICAST_SINGLE = 'tricast_single',
  TRICAST_REVERSE = 'reverse_tricast',
  TRICAST_COMBINATION = 'tricast_combination',
  EXACTA = 'exacta', // 1st and 2nd horses in exact order.
  TRIFECTA = 'trifecta', //1st, 2nd and 3rd horses in exact order.
  SWINGER = 'swinger', // Pick 2 horses to both finish in the top 3, in any order.
}

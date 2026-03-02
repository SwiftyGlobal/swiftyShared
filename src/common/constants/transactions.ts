export const ManualDepositAdjustments = [
  'deposit_non_trading_adjustment',
  'deposit_non_trading_adjustment_bank_transfer',
  'deposit_non_trading_adjustment_card',
  'deposit_non_trading_adjustment_wallet',
  'deposit_non_trading_adjustment_cash',
];

export const ManualWithdrawalAdjustments = [
  'withdrawal_non_trading_adjustment_bank_transfer',
  'withdrawal_non_trading_adjustment_wallet',
  'withdrawal_non_trading_adjustment_card',
  'withdrawal_non_trading_adjustment_cash',
];

export const ManualAdjustments = [...ManualDepositAdjustments, ...ManualWithdrawalAdjustments];

export const NonManualDepositAdjustments = [
  'deposit_adjustment',
  'deposit_trading_adjustment',
  'deposit_trading_adjustment_bog',
  'deposit_trading_adjustment_cashback',
  'deposit_trading_adjustment_other',
];

export const NonManualWithdrawalAdjustments = [
  'withdrawal_adjustment',
  'withdrawal_trading_adjustment',
  'withdrawal_trading_adjustment_bog',
  'withdrawal_trading_adjustment_cashback',
  'withdrawal_trading_adjustment_other',
  'cancel_cash_free_bet',
  'subtract_free_bet',
];

export const NonManualAdjustments = [
  ...NonManualDepositAdjustments,
  ...NonManualWithdrawalAdjustments,
  'add_user_balance_adjustment',
  'add_cash_free_bet',
  'user_balance_adjustment',
];

export const CasinoDepositAdjustments = ['deposit_casino_adjustment_cashback', 'deposit_casino_adjustment_other'];

export const CasinoWithdrawalAdjustments = [
  'withdrawal_casino_adjustment_cashback',
  'withdrawal_casino_adjustment_other',
];

export const CasinoAdjustments = [...CasinoDepositAdjustments, ...CasinoWithdrawalAdjustments];

export const DepositTransactionTypes = [
  'deposit',
  'depsit',
  'deposit_card',
  'deposit_bank_transfer',
  'deposit_hexopay_credit_card',
  'deposit_nixxe',
  'deposit_wallet',
  'deposit_undefined',
  'deposit_credit_card',
  'deposit_apple_pay',
];

export const WithdrawalTransactionTypes = [
  'withdrawal',
  'withdrawal_card',
  'withdrawal_bank_transfer',
  'withdrawal_nixxe',
  'withdrawal_paysafe',
  'withdrawal_wallet',
];

export const SportStakesTransactionTypes = [
  'bet_slip_place_canadian',
  'bet_slip_place_double',
  'bet_slip_place_each_way',
  'bet_slip_place_fold4',
  'bet_slip_place_fold5',
  'bet_slip_place_fold6',
  'bet_slip_place_fold7',
  'bet_slip_place_fold8',
  'bet_slip_place_fold9',
  'bet_slip_place_fold10',
  'bet_slip_place_fold11',
  'bet_slip_place_fold12',
  'bet_slip_place_fold13',
  'bet_slip_place_fold14',
  'bet_slip_place_fold15',
  'bet_slip_place_fold16',
  'bet_slip_place_fold17',
  'bet_slip_place_fold18',
  'bet_slip_place_fold19',
  'bet_slip_place_fold20',
  'bet_slip_place_fold21',
  'bet_slip_place_fold22',
  'bet_slip_place_fold23',
  'bet_slip_place_fold24',
  'bet_slip_place_fold25',
  'bet_slip_place_forecast',
  'bet_slip_place_heinz',
  'bet_slip_place_lucky15',
  'bet_slip_place_lucky31',
  'bet_slip_place_lucky63',
  'bet_slip_place_patent',
  'bet_slip_place_reverse_forecast',
  'bet_slip_place_reverse_tricast',
  'bet_slip_place_single',
  'bet_slip_place_goliath',
  'bet_slip_place_supergoliath',
  'bet_slip_place_superheinz',
  'bet_slip_place_treble',
  'bet_slip_place_tricast',
  'bet_slip_place_trixie',
  'bet_slip_place_unnamed_favorite',
  'bet_slip_place_yankee',
  'bet_slip_place_forecast_single',
  'bet_slip_place_forecast_revers',
  'bet_slip_place_forecast_combination',
  'bet_slip_place_tricast_single',
  'bet_slip_place_tricast_combination',
  'bet_slip_place_forecast_reverse',
  'bet_slip_place_exacta',
  'bet_slip_place_trifecta',
  'bet_slip_place_swinger',
  'bet_builder',
  'place_empty_leg',
  'bet_place',
  'cancel_bet_payout',
  'cancel_bet_pushed',
  'cancel_bet_lose',
];

export const SportPushedTransactionTypes = ['bet_pushed', 'bet_cancel', 'bet_undo', 'bet_pushed_single'];

export const SportReturnsTransactionTypes = [
  'bet_win_canadian',
  'bet_win_double',
  'bet_win_ew',
  'bet_win_lucky15',
  'bet_win_single',
  'bet_win_sp',
  'bet_win_treble',
  'bet_win_trixie',
  'bet_win_yankee',
  'bet_win_fold4',
  'bet_win_fold5',
  'bet_win_fold6',
  'bet_win_fold7',
  'bet_win_fold8',
  'bet_win_fold9',
  'bet_win_fold10',
  'bet_win_fold11',
  'bet_win_fold12',
  'bet_win_fold13',
  'bet_win_fold14',
  'bet_win_fold15',
  'bet_win_fold16',
  'bet_win_fold17',
  'bet_win_fold18',
  'bet_win_fold19',
  'bet_win_fold20',
  'bet_win_fold21',
  'bet_win_fold22',
  'bet_win_fold23',
  'bet_win_fold24',
  'bet_win_fold25',
  'bet_win_forecast',
  'bet_win_heinz',
  'bet_win_lucky31',
  'bet_win_lucky63',
  'bet_win_patent',
  'bet_win_reverse_forecast',
  'bet_win_reverse_tricast',
  'bet_win_supergoliath',
  'bet_win_superheinz',
  'bet_win_tricast',
  'bet_win_unnamed_favorite',
  'bet_win_forecast_single',
  'bet_win_forecast_reverse',
  'bet_win_forecast_combination',
  'bet_win_tricast_single',
  'bet_win_tricast_combination',
  'bet_win_forecast_revers',
  'bet_win_exacta',
  'bet_win_trifecta',
  'bet_win_swinger',
  'bet_win_bet_builder',
  'bet_win',
  'bet_slip_cash_out',
  'bet_win_goliath',
  'bet_lose',
];

export const CasinoBetTransactionTypes = ['cancel_casino_result', 'casino_bet'];

export const CasinoResultTransactionTypes = ['casino_result', 'cancel_casino_bet'];

export const DeductingTransactionsBets = [...SportStakesTransactionTypes, ...CasinoBetTransactionTypes];

export const AdditionTransactionsBets = [
  ...SportReturnsTransactionTypes,
  ...SportPushedTransactionTypes,
  ...CasinoResultTransactionTypes,
];

export const SportsTransactionType = [
  ...SportStakesTransactionTypes,
  ...SportReturnsTransactionTypes,
  ...SportPushedTransactionTypes,
];

export const AdditionTransactionTypes = [
  ...AdditionTransactionsBets,
  ...DepositTransactionTypes,
  ...ManualDepositAdjustments,
  ...NonManualDepositAdjustments,
  ...CasinoDepositAdjustments,
  'add_cash_free_bet',
  'add_bonus',
  'add_free_bet',
];

export const DeductionTransactionTypes = [
  ...DeductingTransactionsBets,
  ...WithdrawalTransactionTypes,
  ...ManualWithdrawalAdjustments,
  ...NonManualWithdrawalAdjustments,
  ...CasinoWithdrawalAdjustments,
];

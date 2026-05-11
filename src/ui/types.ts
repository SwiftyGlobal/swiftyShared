export interface BetBuilderOption {
  bet_id?: string | number;
  id?: string | number;
  name: string;
  odds?: number | string;
  column?: string | number;
  [key: string]: unknown;
}

export interface BetBuilderSelectionGroup {
  name: string;
  show_name?: boolean;
  options: BetBuilderOption[];
}

export interface BetBuilderMarket {
  id: string | number;
  name: string;
  columns?: number | string[];
  selections: BetBuilderSelectionGroup[];
  round_to_flat?: number;
  show_name?: boolean;
}

export interface BetBuilderEvent {
  event_id: string | number;
  event_name: string;
  start_time?: string | number;
}

export interface SelectionClickPayload {
  option: BetBuilderOption;
  market: BetBuilderMarket;
  group: BetBuilderSelectionGroup;
}

export type SelectionClickHandler = (payload: SelectionClickPayload) => void;

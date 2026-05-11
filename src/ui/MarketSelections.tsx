import type {
  BetBuilderMarket,
  BetBuilderOption,
  BetBuilderSelectionGroup,
  SelectionClickHandler,
} from "./types";

interface MarketSelectionsProps {
  market: BetBuilderMarket;
  group: BetBuilderSelectionGroup;
  selectedBetIds: Set<string>;
  onSelectionClick: SelectionClickHandler;
}

function getOptionKey(option: BetBuilderOption): string {
  const id = option.bet_id ?? option.id;
  return id == null ? "" : String(id);
}

function formatOdds(odds: unknown): string {
  if (odds == null) return "-";
  const num = typeof odds === "number" ? odds : Number(odds);
  if (Number.isNaN(num)) return String(odds);
  return num.toFixed(2);
}

export const MarketSelections = ({
  market,
  group,
  selectedBetIds,
  onSelectionClick,
}: MarketSelectionsProps) => {
  if (!group?.options?.length) return null;

  return (
    <div className="bb-ui__selections">
      {group.options.map((option) => {
        const key = getOptionKey(option);
        const isSelected = key !== "" && selectedBetIds.has(key);
        const label = group.show_name === false ? option.name : `${group.name} - ${option.name}`;

        return (
          <button
            type="button"
            key={`${key}-${option.name}`}
            className={`bb-ui__selection${isSelected ? " bb-ui__selection--selected" : ""}`}
            onClick={() => onSelectionClick({ option, market, group })}
          >
            <span className="bb-ui__selection-name">{label}</span>
            <span className="bb-ui__selection-odds">{formatOdds(option.odds)}</span>
          </button>
        );
      })}
    </div>
  );
};

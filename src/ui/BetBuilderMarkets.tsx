import { useState } from "react";
import { TabsSelect } from "./TabsSelect";
import { MarketSelections } from "./MarketSelections";
import { EmptyState } from "./EmptyState";
import type {
  BetBuilderEvent,
  BetBuilderMarket,
  BetBuilderOption,
  SelectionClickHandler,
} from "./types";

interface SingleMarketProps {
  market: BetBuilderMarket;
  selectedBetIds: Set<string>;
  onSelectionClick: SelectionClickHandler;
}

const SingleMarket = ({ market, selectedBetIds, onSelectionClick }: SingleMarketProps) => {
  const groups = market.selections ?? [];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeGroup = groups[selectedIdx];

  if (!activeGroup) return null;

  const columnsRaw = market.columns ?? 1;
  const columnList = Array.isArray(columnsRaw)
    ? columnsRaw
    : Array.from({ length: Number(columnsRaw) || 1 }, (_, i) => `column${i + 1}`);

  let autoIdx = 0;
  const groupedByColumn = activeGroup.options.reduce<Record<string, BetBuilderOption[]>>(
    (acc, option) => {
      let col = option.column;
      if (!col || col === "0" || col === 0) {
        col = columnList[autoIdx % columnList.length];
        autoIdx += 1;
      }
      const key = String(col);
      if (!acc[key]) acc[key] = [];
      acc[key].push({ ...option, column: col });
      return acc;
    },
    {}
  );

  const columnGroups = Object.values(groupedByColumn);

  return (
    <section className="bb-ui__market">
      <header className="bb-ui__market-header">
        <h3 className="bb-ui__market-name">{market.name}</h3>
        {groups.length > 1 ? (
          <TabsSelect
            data={groups.map((g, i) => ({ id: i, label: g.name }))}
            selectedItemId={selectedIdx}
            onChange={(t) => setSelectedIdx(Number(t.id))}
          />
        ) : null}
      </header>
      <div
        className="bb-ui__market-grid"
        style={{ gridTemplateColumns: `repeat(${columnGroups.length || 1}, minmax(0, 1fr))` }}
      >
        {columnGroups.map((column, idx) => (
          <MarketSelections
            key={idx}
            market={market}
            group={{ ...activeGroup, options: column }}
            selectedBetIds={selectedBetIds}
            onSelectionClick={onSelectionClick}
          />
        ))}
      </div>
    </section>
  );
};

interface BetBuilderMarketsProps {
  markets: BetBuilderMarket[] | null | undefined;
  event: BetBuilderEvent;
  selectedBetIds: Set<string>;
  onSelectionClick: SelectionClickHandler;
  emptyMessage?: string;
}

export const BetBuilderMarkets = ({
  markets,
  event: _event,
  selectedBetIds,
  onSelectionClick,
  emptyMessage = "No markets available",
}: BetBuilderMarketsProps) => {
  if (!markets?.length) return <EmptyState message={emptyMessage} />;

  return (
    <div className="bb-ui__markets">
      {markets.map((market) => (
        <SingleMarket
          key={String(market.id)}
          market={market}
          selectedBetIds={selectedBetIds}
          onSelectionClick={onSelectionClick}
        />
      ))}
    </div>
  );
};

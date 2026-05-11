import { useEffect, useState } from "react";

interface Tab {
  id: string | number;
  label: string;
}

interface TabsSelectProps {
  data: Tab[];
  selectedItemId?: string | number;
  onChange?: (tab: Tab) => void;
  placeholder?: string;
}

export const TabsSelect = ({ data, selectedItemId, onChange }: TabsSelectProps) => {
  const initial = data?.find((t) => t.id === selectedItemId) ?? data?.[0];
  const [selected, setSelected] = useState<Tab | undefined>(initial);

  useEffect(() => {
    if (selectedItemId == null) return;
    const next = data?.find((t) => t.id === selectedItemId);
    if (next) setSelected(next);
  }, [selectedItemId, data]);

  const handleClick = (tab: Tab) => {
    setSelected(tab);
    onChange?.(tab);
  };

  if (!data?.length) return null;

  return (
    <ul className="bb-ui__tabs">
      {data.map((tab) => {
        const isActive = selected?.id === tab.id;
        return (
          <li
            key={`${tab.id}-${tab.label}`}
            className={`bb-ui__tab${isActive ? " bb-ui__tab--active" : ""}`}
            onClick={() => handleClick(tab)}
          >
            {tab.label}
          </li>
        );
      })}
    </ul>
  );
};

import { TRADES, type Trade } from '../types';

interface Props {
  selected: Trade;
  onChange: (trade: Trade) => void;
}

export function TradeToggle({ selected, onChange }: Props) {
  return (
    <div className="inline-flex rounded-xl bg-slate-100 p-1 no-print">
      {TRADES.map(({ id, label }) => {
        const active = id === selected;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              active ? 'bg-brand-navy text-white shadow' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

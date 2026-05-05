import { useState } from 'react';
import type { Trade } from '../types';

const COLD_PLACEHOLDERS: Record<Trade, string> = {
  hvac: 'e.g. Replaced 14-year-old gas furnace with high-efficiency unit, plus new programmable thermostat. Job ran longer than estimated — 14 hr labor instead of 12. Customer asked us to add a return-air vent on second floor.',
  plumbing: 'e.g. Replaced 12-year-old 50-gallon tank water heater with a tankless unit in the garage. Required gas line resize and new venting. Took about 11 hours total.',
  electrical: 'e.g. Installed Level 2 EV charging circuit (240V, 50A) in garage. About 35 ft conduit run from main panel. Final inspection passed.',
  roofing: 'e.g. Completed full roof replacement on 2,200 sq ft single-story home. Tore off old asphalt shingles, installed 30-year architectural shingles with synthetic underlayment.',
};

const DELTA_PLACEHOLDER = 'e.g. Job took 14 hr instead of 12. Customer added a 4th return vent. Add an extra labor charge for the additional vent.';

interface Props {
  trade: Trade;
  mode: 'cold' | 'delta';
  onGenerate: (text: string) => void;
  isGenerating: boolean;
}

export function JobInput({ trade, mode, onGenerate, isGenerating }: Props) {
  const [text, setText] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (mode === 'delta') {
      // delta allows empty submission (no changes)
      if (!isGenerating) onGenerate(trimmed);
    } else {
      if (trimmed && !isGenerating) onGenerate(trimmed);
    }
  };

  const label = mode === 'cold'
    ? 'Or describe what you finished:'
    : 'What changed since the quote? (optional)';
  const placeholder = mode === 'cold' ? COLD_PLACEHOLDERS[trade] : DELTA_PLACEHOLDER;
  const buttonLabel = mode === 'cold' ? 'Generate Invoice' : 'Re-generate with changes';
  const loadingLabel = 'Generating invoice…';
  const submitDisabled = isGenerating || (mode === 'cold' && !text.trim());
  const maxChars = mode === 'cold' ? 4000 : 2000;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 no-print">
      <label htmlFor="job-input" className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <textarea
        id="job-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={4}
        maxLength={maxChars}
        disabled={isGenerating}
        className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:bg-slate-50"
      />
      <div className="mt-3 flex justify-between items-center">
        <p className="text-xs text-slate-500">{text.length} / {maxChars} characters</p>
        <button
          type="button"
          onClick={submit}
          disabled={submitDisabled}
          className="bg-brand-navy text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-blue disabled:bg-slate-300 transition-colors"
        >
          {isGenerating ? loadingLabel : buttonLabel}
        </button>
      </div>
    </div>
  );
}

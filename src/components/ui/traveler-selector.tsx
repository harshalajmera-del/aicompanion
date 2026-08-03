'use client';
import * as React from 'react';
import { cn, pluralize } from '@/lib/utils';

interface TravelerCount { adults: number; children: number; infants: number; }

interface TravelerSelectorProps {
  value: TravelerCount;
  onChange: (value: TravelerCount) => void;
  className?: string;
}

function Counter({ label, sublabel, value, min, max, onChange }: {
  label: string; sublabel: string; value: number;
  min: number; max: number; onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <div className="text-sm font-medium text-slate-800">{label}</div>
        <div className="text-xs text-slate-400">{sublabel}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          −
        </button>
        <span className="w-6 text-center font-semibold text-slate-800">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function TravelerSelector({ value, onChange, className }: TravelerSelectorProps) {
  const total = value.adults + value.children + value.infants;
  const summary = [
    pluralize(value.adults, 'adult'),
    value.children > 0 ? pluralize(value.children, 'child', 'children') : null,
    value.infants > 0 ? pluralize(value.infants, 'infant') : null,
  ].filter(Boolean).join(', ');

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white overflow-hidden', className)}>
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-800">
          {total} {total === 1 ? 'traveler' : 'travelers'} — {summary}
        </p>
      </div>
      <div className="px-4">
        <Counter label="Adults" sublabel="Age 13+" value={value.adults} min={1} max={9}
          onChange={n => onChange({ ...value, adults: n })} />
        <Counter label="Children" sublabel="Age 2–12" value={value.children} min={0} max={6}
          onChange={n => onChange({ ...value, children: n })} />
        <Counter label="Infants" sublabel="Under 2" value={value.infants} min={0} max={4}
          onChange={n => onChange({ ...value, infants: n })} />
      </div>
    </div>
  );
}

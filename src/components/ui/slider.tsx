'use client';
import * as React from 'react';
import { cn, formatCurrency } from '@/lib/utils';

interface BudgetSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  currency?: string;
  onChange: (value: number) => void;
  className?: string;
}

export function BudgetSlider({ value, min = 500, max = 20000, step = 250, currency = 'USD', onChange, className }: BudgetSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-500">Budget</span>
        <span className="text-lg font-bold text-orange-500">{formatCurrency(value, currency)}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          aria-label="Budget slider"
        />
        <div
          className="absolute w-5 h-5 bg-white border-2 border-orange-500 rounded-full shadow-md pointer-events-none transition-all"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>{formatCurrency(min, currency)}</span>
        <span>{formatCurrency(max, currency)}</span>
      </div>
    </div>
  );
}

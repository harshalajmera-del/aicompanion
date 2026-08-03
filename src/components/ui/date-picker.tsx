'use client';
import * as React from 'react';
import { cn, formatDate } from '@/lib/utils';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onSelect: (start: string, end: string) => void;
  minDate?: string;
  className?: string;
}

export function DateRangePicker({ startDate, endDate, onSelect, minDate, className }: DateRangePickerProps) {
  const today = new Date().toISOString().split('T')[0];
  const min = minDate ?? today;

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-4 space-y-3', className)}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Departure</label>
          <input
            type="date"
            min={min}
            value={startDate ?? ''}
            onChange={e => onSelect(e.target.value, endDate ?? '')}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Return</label>
          <input
            type="date"
            min={startDate ?? min}
            value={endDate ?? ''}
            onChange={e => onSelect(startDate ?? '', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>
      </div>
      {startDate && endDate && (
        <p className="text-xs text-slate-500 text-center">
          ✈️ {formatDate(startDate, 'EEE, MMM d')} → {formatDate(endDate, 'EEE, MMM d, yyyy')}
        </p>
      )}
    </div>
  );
}

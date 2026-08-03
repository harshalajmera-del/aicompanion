'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Chip({ label, selected, onClick, icon, disabled, className, size = 'md' }: ChipProps) {
  const sizes = { sm: 'px-2.5 py-1 text-xs', md: 'px-3.5 py-1.5 text-sm', lg: 'px-4 py-2 text-base' };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 select-none border',
        sizes[size],
        selected
          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200'
          : 'bg-white text-slate-700 border-slate-200 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

interface ChipGroupProps {
  chips: Array<{ id: string; label: string; icon?: string }>;
  selected: string[];
  onToggle: (id: string) => void;
  multi?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ChipGroup({ chips, selected, onToggle, multi = true, className, size }: ChipGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {chips.map(chip => (
        <Chip
          key={chip.id}
          label={chip.label}
          icon={chip.icon}
          selected={selected.includes(chip.id)}
          size={size}
          onClick={() => {
            if (!multi) onToggle(chip.id);
            else onToggle(chip.id);
          }}
        />
      ))}
    </div>
  );
}

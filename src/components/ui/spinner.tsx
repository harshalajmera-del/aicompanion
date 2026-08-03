'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

export function Spinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };
  return (
    <svg className={cn('animate-spin text-orange-500', s[size], className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-white rounded-2xl rounded-tl-sm shadow-md border border-slate-100 w-16">
      {[0, 0.2, 0.4].map((delay, i) => (
        <div key={i} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}s`, animationDuration: '1.2s' }} />
      ))}
    </div>
  );
}

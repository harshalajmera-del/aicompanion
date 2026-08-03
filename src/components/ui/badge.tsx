'use client';
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:  'bg-orange-100 text-orange-700',
        success:  'bg-emerald-100 text-emerald-700',
        warning:  'bg-amber-100 text-amber-700',
        danger:   'bg-red-100 text-red-700',
        info:     'bg-blue-100 text-blue-700',
        muted:    'bg-slate-100 text-slate-600',
        purple:   'bg-purple-100 text-purple-700',
        outline:  'border border-current bg-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

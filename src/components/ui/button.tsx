'use client';
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default:   'bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg active:scale-[0.98]',
        secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
        outline:   'border border-slate-200 bg-white text-slate-800 hover:border-orange-400 hover:text-orange-600',
        ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-800',
        danger:    'bg-red-500 text-white hover:bg-red-600',
        success:   'bg-emerald-500 text-white hover:bg-emerald-600',
        link:      'text-orange-500 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm:   'h-8  px-3 text-xs',
        md:   'h-10 px-4',
        lg:   'h-12 px-6 text-base',
        xl:   'h-14 px-8 text-lg',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  ),
);
Button.displayName = 'Button';
export { buttonVariants };

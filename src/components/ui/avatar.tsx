'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg' };

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  return (
    <div className={cn('rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 select-none', sizes[size], className)}>
      {src ? (
        <img src={src} alt={alt ?? 'avatar'} className="w-full h-full object-cover" />
      ) : (
        <span>{fallback ?? '?'}</span>
      )}
    </div>
  );
}

export function AriaAvatar({ size = 'md', className }: { size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string }) {
  return (
    <div className={cn('rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-orange-400 to-purple-600 text-white font-bold shadow-md', sizes[size], className)}>
      A
    </div>
  );
}

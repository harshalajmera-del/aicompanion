'use client';
import * as React from 'react';
import { Menu, X, Globe, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STAGE_LABELS } from '@/lib/constants';
import { getStageProgress, STAGE_BREADCRUMBS } from '@/engines/conversation/state-machine';
import type { ConversationStage } from '@/types/conversation';

interface AriaHeaderProps {
  stage: ConversationStage;
  destination?: string;
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
  className?: string;
}

export function AriaHeader({ stage, destination, onMenuToggle, sidebarOpen, className }: AriaHeaderProps) {
  const progress = getStageProgress(stage);
  const stageLabel = STAGE_LABELS[stage] ?? stage;
  const currentCrumb = STAGE_BREADCRUMBS.find(b => (b.stages as readonly string[]).includes(stage));

  return (
    <header className={cn('bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3', className)}>
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Brand */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">
          A
        </div>
        <span className="font-black text-base bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent hidden sm:block">
          Aria
        </span>
      </div>

      {/* Stage breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-slate-500 ml-1">
        <span className="hidden sm:block text-slate-300">/</span>
        <span className="hidden sm:block text-slate-400 text-xs">{currentCrumb?.label}</span>
        <span className="text-slate-300 text-xs">/</span>
        <span className="text-slate-700 font-semibold text-xs flex items-center gap-1">
          <Sparkles size={11} className="text-orange-400" />
          {stageLabel}
        </span>
        {destination && (
          <>
            <span className="text-slate-300 text-xs">—</span>
            <span className="text-slate-600 text-xs flex items-center gap-1">
              <Globe size={11} className="text-slate-400" />
              {destination}
            </span>
          </>
        )}
      </div>

      {/* Progress bar */}
      <div className="ml-auto flex items-center gap-2 min-w-0">
        <div className="hidden sm:block w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="hidden sm:block text-[10px] text-slate-400 flex-shrink-0">{progress}%</span>
      </div>
    </header>
  );
}

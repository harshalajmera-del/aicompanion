'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Star, CheckCircle, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import type { ActivityOffer } from '@/types/activity';

interface ActivityResultsProps {
  activities: ActivityOffer[];
  onSelect?: (activity: ActivityOffer) => void;
  selectedIds?: string[];
}

export function ActivityResults({ activities, onSelect, selectedIds = [] }: ActivityResultsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Experiences to book</p>
      <div className="grid grid-cols-1 gap-2">
        {activities.map((act, i) => (
          <ActivityCard key={act.id} activity={act} index={i} onSelect={onSelect}
            isSelected={selectedIds.includes(act.id)} />
        ))}
      </div>
    </div>
  );
}

function ActivityCard({ activity, index, onSelect, isSelected }: {
  activity: ActivityOffer; index: number;
  onSelect?: (a: ActivityOffer) => void; isSelected: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={cn(
        'rounded-2xl border bg-white overflow-hidden transition-all duration-200 hover:shadow-md',
        isSelected ? 'border-orange-400 ring-2 ring-orange-100' : 'border-slate-100',
      )}
    >
      <div className="flex gap-3 p-3">
        {/* Image */}
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <img src={activity.images[0]?.url} alt={activity.name}
            className="w-full h-full object-cover" loading="lazy" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 line-clamp-1">{activity.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-0.5 text-[11px] text-amber-600 font-semibold">
              <Star size={9} className="fill-amber-400 text-amber-400" />{activity.rating.score}
            </span>
            <span className="text-[10px] text-slate-400">({activity.rating.reviewCount.toLocaleString()})</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="flex items-center gap-0.5 text-[10px] text-slate-500">
              <Clock size={9} />{activity.duration.label}
            </span>
            {activity.groupSize.private && (
              <Badge variant="purple" className="text-[9px]">Private</Badge>
            )}
            {activity.cancellationPolicy.type === 'free' && (
              <Badge variant="success" className="text-[9px]">Free cancel</Badge>
            )}
          </div>
          <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">{activity.shortDescription}</p>
        </div>

        {/* Price + action */}
        <div className="flex flex-col items-end justify-between flex-shrink-0">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">{formatCurrency(activity.price.adult, activity.price.currency)}</p>
            <p className="text-[10px] text-slate-400">per adult</p>
          </div>
          <button
            onClick={() => onSelect?.(activity)}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
              isSelected
                ? 'bg-emerald-500 text-white hover:bg-red-400'
                : 'bg-orange-500 text-white hover:bg-orange-600',
            )}
            aria-label={isSelected ? 'Remove activity' : 'Add activity'}
          >
            {isSelected ? <CheckCircle size={14} /> : <Plus size={14} />}
          </button>
        </div>
      </div>

      {/* Aria note */}
      {activity.ariaNote && (
        <div className="px-3 pb-2.5">
          <p className="text-[10px] text-purple-600 italic">💜 {activity.ariaNote}</p>
        </div>
      )}
    </motion.div>
  );
}

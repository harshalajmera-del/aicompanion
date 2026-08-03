'use client';
import * as React from 'react';
import { MapPin, Calendar, Users, DollarSign, Heart, RotateCcw, ChevronRight } from 'lucide-react';
import { cn, formatCurrency, formatDateRange, pluralize } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { STAGE_BREADCRUMBS } from '@/engines/conversation/state-machine';
import { STAGE_LABELS, INTEREST_LABELS } from '@/lib/constants';
import type { TripMemory, UserProfile } from '@/types/memory';
import type { ConversationStage } from '@/types/conversation';

interface MemorySidebarProps {
  trip: TripMemory;
  profile: UserProfile;
  stage: ConversationStage;
  onReset?: () => void;
  className?: string;
}

export function MemorySidebar({ trip, profile, stage, onReset, className }: MemorySidebarProps) {
  const currentCrumb = STAGE_BREADCRUMBS.find(b => (b.stages as readonly string[]).includes(stage));
  const stageLabel = STAGE_LABELS[stage] ?? stage;

  return (
    <aside className={cn('flex flex-col h-full bg-white border-r border-slate-100 overflow-y-auto scrollbar-thin', className)}>
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-md">
            A
          </div>
          <div>
            <h1 className="font-black text-xl bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">Aria</h1>
            <p className="text-[11px] text-slate-400">AI Travel Consultant</p>
          </div>
        </div>
      </div>

      {/* Progress breadcrumbs */}
      <div className="p-4 border-b border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Your journey</p>
        <div className="space-y-1">
          {STAGE_BREADCRUMBS.map((crumb, crumbIdx) => {
            const currentIdx = currentCrumb ? STAGE_BREADCRUMBS.indexOf(currentCrumb) : -1;
            const isCurrent = crumb.id === currentCrumb?.id;
            const isPast = crumbIdx < currentIdx;
            return (
              <div key={crumb.id} className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all',
                isCurrent && 'bg-orange-50 text-orange-600 font-semibold',
                isPast && 'text-emerald-600',
                !isCurrent && !isPast && 'text-slate-300',
              )}>
                <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                  isCurrent && 'bg-orange-500 text-white',
                  isPast && 'bg-emerald-100 text-emerald-600',
                  !isCurrent && !isPast && 'bg-slate-100 text-slate-300',
                )}>
                  {isPast ? '✓' : crumbIdx + 1}
                </div>
                <span>{crumb.label}</span>
                {isCurrent && <ChevronRight size={12} className="ml-auto" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trip context */}
      <div className="p-4 space-y-3 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">What I know so far</p>

        <MemoryItem icon={<MapPin size={12} />} label="Destination" value={
          trip.destinationHierarchy.length > 0
            ? trip.destinationHierarchy.join(' → ')
            : trip.destination
        } />
        <MemoryItem icon={<MapPin size={12} />} label="Flying from" value={trip.originCity} />
        <MemoryItem icon={<Calendar size={12} />} label="Dates" value={
          trip.startDate && trip.endDate
            ? formatDateRange(trip.startDate, trip.endDate)
            : trip.durationDays
              ? `${trip.durationDays} days`
              : undefined
        } />
        <MemoryItem icon={<Users size={12} />} label="Travelers" value={
          trip.adults
            ? [
                pluralize(trip.adults, 'adult'),
                trip.children ? pluralize(trip.children, 'child', 'children') : null,
              ].filter(Boolean).join(', ')
            : undefined
        } />
        <MemoryItem icon={<DollarSign size={12} />} label="Budget" value={
          trip.budget ? formatCurrency(trip.budget, trip.currency ?? 'USD') : undefined
        } />

        {profile.interests.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
              <Heart size={10} /> Interests
            </p>
            <div className="flex flex-wrap gap-1">
              {profile.interests.slice(0, 5).map(interest => (
                <Badge key={interest} variant="muted" className="text-[10px]">
                  {INTEREST_LABELS[interest] ?? interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Booking status */}
        {trip.itineraryApproved && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 text-xs text-emerald-700">
            <p className="font-semibold">✅ Itinerary approved</p>
            {trip.selectedFlightId && <p className="mt-0.5 opacity-70">✈️ Flight selected</p>}
            {trip.selectedHotelId && <p className="opacity-70">🏨 Hotel selected</p>}
            {trip.selectedActivityIds.length > 0 && (
              <p className="opacity-70">🎭 {pluralize(trip.selectedActivityIds.length, 'activity', 'activities')}</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100">
        <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-slate-600" onClick={onReset}>
          <RotateCcw size={12} /> Start new trip
        </Button>
      </div>
    </aside>
  );
}

function MemoryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-300 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400">{label}</p>
        <p className="text-xs font-semibold text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}

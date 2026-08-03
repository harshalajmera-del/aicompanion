'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { DestinationCard } from './destination-card';
import { Chip } from '@/components/ui/chip';
import type { DestinationSuggestion, Destination } from '@/types/destination';
import { POPULAR_DESTINATIONS, POPULAR_CONTINENTS } from '@/lib/constants';

interface DestinationGridProps {
  suggestions: DestinationSuggestion[];
  onSelect: (dest: Destination) => void;
  onTextSearch?: (query: string) => void;
  showQuickChips?: boolean;
}

export function DestinationGrid({ suggestions, onSelect, onTextSearch, showQuickChips = true }: DestinationGridProps) {
  return (
    <div className="space-y-3">
      {/* Quick chip filters */}
      {showQuickChips && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Popular regions</p>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_CONTINENTS.map(c => (
              <Chip key={c} label={c} size="sm" onClick={() => onTextSearch?.(c)} />
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_DESTINATIONS.slice(0, 8).map(d => (
              <Chip key={d} label={d} size="sm" onClick={() => onTextSearch?.(d)} />
            ))}
          </div>
        </div>
      )}

      {/* Destination cards */}
      {suggestions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Suggestions for you</p>
          <div className="grid grid-cols-2 gap-3">
            {suggestions.map(({ destination, reasons }, i) => (
              <motion.div key={destination.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <DestinationCard destination={destination} reasons={reasons} onSelect={onSelect} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

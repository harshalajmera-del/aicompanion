'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Destination } from '@/types/destination';

interface DestinationCardProps {
  destination: Destination;
  reasons?: string[];
  score?: number;
  onSelect: (dest: Destination) => void;
  className?: string;
}

export function DestinationCard({ destination, reasons, onSelect, className }: DestinationCardProps) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const bestMonthLabel = destination.bestMonths.slice(0, 3).map(m => months[m]).join(', ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className={cn('group rounded-2xl overflow-hidden bg-white shadow-md border border-slate-100 cursor-pointer transition-shadow hover:shadow-xl', className)}
      onClick={() => onSelect(destination)}
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-3 right-3">
          <h3 className="text-white font-bold text-base leading-tight">{destination.name}</h3>
          <div className="flex items-center gap-1 text-white/80 text-xs">
            <MapPin size={10} />
            <span>{destination.country}</span>
          </div>
        </div>
        {destination.budgetTier === 'budget' && (
          <Badge className="absolute top-2 right-2" variant="success">Budget-friendly</Badge>
        )}
        {destination.budgetTier === 'luxury' && (
          <Badge className="absolute top-2 right-2" variant="purple">Luxury</Badge>
        )}
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        <p className="text-xs text-slate-500 line-clamp-2">{destination.tagline}</p>

        {reasons && reasons.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {reasons.slice(0, 2).map((r, i) => (
              <span key={i} className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                {r}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            Best: {bestMonthLabel}
          </span>
          <span className="flex gap-1">
            {destination.tags.slice(0, 2).map(t => (
              <Badge key={t} variant="muted" className="text-[10px] py-0">{t}</Badge>
            ))}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

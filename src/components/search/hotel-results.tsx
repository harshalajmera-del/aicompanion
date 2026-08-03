'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Wifi, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency, ratingLabel } from '@/lib/utils';
import type { HotelOffer } from '@/types/hotel';

interface HotelResultsProps {
  hotels: HotelOffer[];
  onSelect?: (hotel: HotelOffer) => void;
  selectedId?: string;
}

export function HotelResults({ hotels, onSelect, selectedId }: HotelResultsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Recommended hotels</p>
      {hotels.map((hotel, i) => (
        <HotelCard key={hotel.id} hotel={hotel} index={i} onSelect={onSelect}
          isSelected={selectedId === hotel.id} isRecommended={i === 0} />
      ))}
    </div>
  );
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={10} className={i < stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
      ))}
    </div>
  );
}

function HotelCard({ hotel, index, onSelect, isSelected, isRecommended }: {
  hotel: HotelOffer; index: number; onSelect?: (h: HotelOffer) => void;
  isSelected: boolean; isRecommended: boolean;
}) {
  const cheapestRoom = hotel.rooms[0];
  const isFreeCancellation = hotel.cancellationPolicy.type === 'free';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        'rounded-2xl border bg-white overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg',
        isSelected ? 'border-orange-400 ring-2 ring-orange-100 shadow-md' : 'border-slate-100',
      )}
      onClick={() => onSelect?.(hotel)}
    >
      <div className="flex">
        {/* Image */}
        <div className="w-28 flex-shrink-0 relative">
          <img src={hotel.images[0]?.url} alt={hotel.name}
            className="w-full h-full object-cover" loading="lazy" />
          {isRecommended && (
            <div className="absolute top-1.5 left-1.5">
              <Badge variant="default" className="text-[9px] px-1.5">Aria pick</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{hotel.name}</p>
              <StarRating stars={hotel.starRating} />
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin size={9} />{hotel.neighborhood}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-slate-800">
                {formatCurrency(cheapestRoom?.price.perNight ?? 0, cheapestRoom?.price.currency ?? 'USD')}
              </p>
              <p className="text-[10px] text-slate-400">per night</p>
            </div>
          </div>

          {/* Rating + features */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {hotel.guestRating.overall} {hotel.guestRating.label}
            </span>
            <span className="text-[10px] text-slate-400">({hotel.guestRating.reviewCount.toLocaleString()})</span>
            {hotel.amenities.includes('wifi') && <Badge variant="muted" className="text-[9px]"><Wifi size={8} /> WiFi</Badge>}
            {isFreeCancellation && <Badge variant="success" className="text-[9px]">Free cancel</Badge>}
          </div>

          {/* Aria note */}
          {hotel.ariaRecommendationNote && (
            <p className="text-[10px] text-purple-600 mt-1.5 line-clamp-2 italic">
              💜 {hotel.ariaRecommendationNote}
            </p>
          )}

          {/* Action */}
          {isSelected ? (
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold mt-2">
              <CheckCircle size={12} /> Selected
            </div>
          ) : (
            <Button size="sm" variant="outline" className="mt-2 text-xs h-7" onClick={e => { e.stopPropagation(); onSelect?.(hotel); }}>
              Choose hotel
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

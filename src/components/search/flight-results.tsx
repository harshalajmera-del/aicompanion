'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { Plane, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency, formatPTDuration, formatStops, formatFlightTime } from '@/lib/utils';
import type { FlightOffer } from '@/types/flight';

interface FlightResultsProps {
  flights: FlightOffer[];
  onSelect?: (flight: FlightOffer) => void;
  selectedId?: string;
}

export function FlightResults({ flights, onSelect, selectedId }: FlightResultsProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Available flights</p>
      {flights.map((flight, i) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          index={i}
          onSelect={onSelect}
          isSelected={selectedId === flight.id}
          isBestValue={i === 0}
        />
      ))}
    </div>
  );
}

function FlightCard({ flight, index, onSelect, isSelected, isBestValue }: {
  flight: FlightOffer; index: number; onSelect?: (f: FlightOffer) => void;
  isSelected: boolean; isBestValue: boolean;
}) {
  const seg = flight.outbound.segments[0];
  const airline = seg.airline;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className={cn(
        'rounded-2xl border p-4 bg-white cursor-pointer transition-all duration-200 hover:shadow-md',
        isSelected ? 'border-orange-400 shadow-md shadow-orange-100 ring-2 ring-orange-100' : 'border-slate-100',
      )}
      onClick={() => onSelect?.(flight)}
    >
      <div className="flex items-start gap-3">
        {/* Airline logo */}
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 font-bold text-sm text-slate-600">
          {airline.code}
        </div>

        <div className="flex-1 min-w-0">
          {/* Route & times */}
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-base font-bold text-slate-800">{formatFlightTime(seg.departure.datetime)}</p>
              <p className="text-xs text-slate-400">{flight.origin.airportCode}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-0.5">
              <p className="text-[10px] text-slate-400">{formatPTDuration(flight.outbound.totalDuration)}</p>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-slate-200" />
                <Plane size={10} className="text-orange-400 rotate-90" />
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <p className="text-[10px] text-slate-400">{formatStops(flight.outbound.stops)}</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-slate-800">{formatFlightTime(seg.arrival.datetime)}</p>
              <p className="text-xs text-slate-400">{flight.destination.airportCode}</p>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[11px] text-slate-500">{airline.name} · {seg.flightNumber}</span>
            {flight.fareConditions.refundable && <Badge variant="success" className="text-[10px]">Refundable</Badge>}
            {flight.baggage.checked.included && <Badge variant="info" className="text-[10px]">Bag included</Badge>}
            {isBestValue && <Badge variant="default" className="text-[10px]">Best value</Badge>}
          </div>
        </div>

        {/* Price & action */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <p className="text-lg font-bold text-slate-800">{formatCurrency(flight.price.total, flight.price.currency)}</p>
            <p className="text-[11px] text-slate-400">{formatCurrency(flight.price.perPerson, flight.price.currency)}/person</p>
          </div>
          {isSelected ? (
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
              <CheckCircle size={12} /> Selected
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => onSelect?.(flight)} className="text-xs h-7">Select</Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

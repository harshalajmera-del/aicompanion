'use client';
import * as React from 'react';
import { Plane, Hotel, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateRange, formatPTDuration, formatStops } from '@/lib/utils';
import type { TripSummary } from '@/types/booking';

interface TripSummaryProps {
  summary: TripSummary;
  onCheckout?: () => void;
  onEdit?: () => void;
}

export function TripSummaryView({ summary, onCheckout, onEdit }: TripSummaryProps) {
  const { flight, hotel, activities, totalCost } = summary;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-4 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Your Trip Summary</h2>
            <p className="text-white/80 text-sm">{summary.destination} · {formatDateRange(summary.startDate, summary.endDate)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs">Total</p>
            <p className="text-2xl font-bold">{formatCurrency(totalCost.total, totalCost.currency)}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Flight */}
        {flight && (
          <SummarySection icon={<Plane size={14} />} label="Flight" color="blue">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {flight.origin.airportCode} → {flight.destination.airportCode}
                  {flight.inbound && ` (Return)`}
                </p>
                <p className="text-xs text-slate-500">
                  {flight.outbound.segments[0].airline.name} · {formatStops(flight.outbound.stops)} · {formatPTDuration(flight.outbound.totalDuration)}
                </p>
              </div>
              <p className="text-sm font-bold text-slate-800">{formatCurrency(flight.price.total, flight.price.currency)}</p>
            </div>
          </SummarySection>
        )}

        {/* Hotel */}
        {hotel && (
          <SummarySection icon={<Hotel size={14} />} label="Hotel" color="purple">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-slate-800">{hotel.name}</p>
                <p className="text-xs text-slate-500">
                  {hotel.neighborhood} · {hotel.nights} nights · {'⭐'.repeat(hotel.starRating)}
                </p>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {formatCurrency(hotel.rooms[0]?.price.total ?? 0, hotel.rooms[0]?.price.currency ?? 'USD')}
              </p>
            </div>
          </SummarySection>
        )}

        {/* Activities */}
        {activities.length > 0 && (
          <SummarySection icon={<Zap size={14} />} label={`Activities (${activities.length})`} color="orange">
            <div className="space-y-1">
              {activities.map(act => (
                <div key={act.id} className="flex justify-between">
                  <p className="text-xs text-slate-700">{act.name}</p>
                  <p className="text-xs font-semibold text-slate-700">{formatCurrency(act.price.adult, act.price.currency)}</p>
                </div>
              ))}
            </div>
          </SummarySection>
        )}

        {/* Cost breakdown */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cost breakdown</p>
          {[
            { label: 'Flights',       amount: totalCost.flights },
            { label: 'Accommodation', amount: totalCost.hotel },
            { label: 'Activities',    amount: totalCost.activities },
            { label: 'Est. food',     amount: totalCost.estimatedFood },
            { label: 'Est. transport',amount: totalCost.estimatedTransport },
            { label: 'Taxes & fees',  amount: totalCost.taxes },
          ].filter(r => r.amount > 0).map(row => (
            <div key={row.label} className="flex justify-between text-xs">
              <span className="text-slate-500">{row.label}</span>
              <span className="font-medium text-slate-700">{formatCurrency(row.amount, totalCost.currency)}</span>
            </div>
          ))}
          <div className="border-t border-slate-200 pt-1.5 flex justify-between">
            <span className="text-sm font-bold text-slate-800">Total</span>
            <span className="text-sm font-bold text-slate-800">{formatCurrency(totalCost.total, totalCost.currency)}</span>
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            {formatCurrency(totalCost.perPerson, totalCost.currency)} per person
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button className="flex-1" size="lg" onClick={onCheckout}>
            <CheckCircle size={16} /> Confirm & Book <ArrowRight size={14} />
          </Button>
          <Button variant="outline" size="lg" onClick={onEdit}>Edit</Button>
        </div>
        <p className="text-[10px] text-slate-400 text-center">
          Secure checkout · No booking fees · Cancel anytime
        </p>
      </div>
    </div>
  );
}

function SummarySection({ icon, label, color, children }: {
  icon: React.ReactNode; label: string;
  color: 'blue' | 'purple' | 'orange'; children: React.ReactNode;
}) {
  const wrapperClass = {
    blue:   'bg-blue-50 border border-blue-100',
    purple: 'bg-purple-50 border border-purple-100',
    orange: 'bg-orange-50 border border-orange-100',
  }[color];
  const labelClass = {
    blue:   'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  }[color];
  return (
    <div className={`rounded-xl p-3 ${wrapperClass}`}>
      <div className={`flex items-center gap-1.5 mb-2 ${labelClass}`}>
        {icon}
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      </div>
      {children}
    </div>
  );
}

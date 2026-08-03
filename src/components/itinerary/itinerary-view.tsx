'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Edit3, ChevronDown, ChevronUp, Utensils, Train, Camera, AlertCircle } from 'lucide-react';
import { cn, formatDate, formatCurrency, formatDurationMinutes } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TRANSPORT_DISCLAIMER, WEATHER_ICONS } from '@/lib/constants';
import type { Itinerary, ItineraryDay, DayPeriod } from '@/types/itinerary';

interface ItineraryViewProps {
  itinerary: Itinerary;
  onApprove?: () => void;
  onEdit?: (change: string) => void;
  compact?: boolean;
}

export function ItineraryView({ itinerary, onApprove, onEdit, compact = false }: ItineraryViewProps) {
  const [expandedDay, setExpandedDay] = React.useState<string | null>(itinerary.days[0]?.id ?? null);
  const [editNote, setEditNote] = React.useState('');
  const [showEdit, setShowEdit] = React.useState(false);

  const toggleDay = (id: string) => setExpandedDay(prev => prev === id ? null : id);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-purple-600 px-5 py-4 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">{itinerary.originCity} → {itinerary.destination}</h2>
            <p className="text-white/80 text-sm mt-0.5">
              {formatDate(itinerary.startDate, 'MMM d')} – {formatDate(itinerary.endDate, 'MMM d, yyyy')} · {itinerary.durationDays} days
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs">Estimated total</p>
            <p className="text-xl font-bold">{formatCurrency(itinerary.budget.total, itinerary.budget.currency)}</p>
          </div>
        </div>
        {/* Traveler summary */}
        <div className="flex gap-3 mt-3 text-sm text-white/80">
          <span>👥 {itinerary.travelers.total} traveler{itinerary.travelers.total > 1 ? 's' : ''}</span>
          <span>💰 {formatCurrency(itinerary.budget.perPerson, itinerary.budget.currency)}/person</span>
          <span>📅 v{itinerary.version}</span>
        </div>
      </div>

      {/* Day list */}
      <div className="divide-y divide-slate-100">
        {itinerary.days.map(day => (
          <DayCard
            key={day.id}
            day={day}
            isExpanded={expandedDay === day.id}
            onToggle={() => toggleDay(day.id)}
            currency={itinerary.budget.currency}
            compact={compact}
          />
        ))}
      </div>

      {/* Transport disclaimer */}
      <div className="mx-4 my-3 rounded-xl bg-amber-50 border border-amber-100 p-3 flex gap-2">
        <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">{TRANSPORT_DISCLAIMER}</p>
      </div>

      {/* Packing list */}
      {itinerary.packingList && itinerary.packingList.length > 0 && (
        <details className="mx-4 mb-3 rounded-xl bg-blue-50 border border-blue-100">
          <summary className="px-3 py-2 text-xs font-semibold text-blue-700 cursor-pointer">🎒 Packing list ({itinerary.packingList.length} items)</summary>
          <div className="px-3 pb-3 flex flex-wrap gap-1.5">
            {itinerary.packingList.map((item, i) => (
              <span key={i} className="text-xs bg-white border border-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{item}</span>
            ))}
          </div>
        </details>
      )}

      {/* Actions */}
      {!itinerary.approved && (
        <div className="p-4 space-y-3 bg-slate-50 border-t border-slate-100">
          {showEdit ? (
            <div className="space-y-2">
              <textarea
                value={editNote}
                onChange={e => setEditNote(e.target.value)}
                placeholder="What would you like to change? e.g. 'Replace Day 2 afternoon with something more relaxing'"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { onEdit?.(editNote); setEditNote(''); setShowEdit(false); }} disabled={!editNote.trim()}>Apply change</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowEdit(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={onApprove}>
                <CheckCircle size={16} /> Looks perfect — let's book!
              </Button>
              <Button variant="outline" size="md" onClick={() => setShowEdit(true)}>
                <Edit3 size={14} /> Edit
              </Button>
            </div>
          )}
        </div>
      )}

      {itinerary.approved && (
        <div className="p-4 bg-emerald-50 border-t border-emerald-100 flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-500" />
          <p className="text-sm text-emerald-700 font-medium">Itinerary approved! Searching for flights…</p>
        </div>
      )}
    </div>
  );
}

function DayCard({ day, isExpanded, onToggle, currency, compact }: {
  day: ItineraryDay; isExpanded: boolean; onToggle: () => void; currency: string; compact: boolean;
}) {
  const weatherIcon = WEATHER_ICONS[day.weather.condition] ?? '🌤️';

  return (
    <div>
      {/* Day header — always visible */}
      <button
        onClick={onToggle}
        className={cn('w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors', day.accepted && 'opacity-70')}
      >
        <div className="flex items-center gap-3">
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
            day.accepted ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600')}>
            {day.accepted ? '✓' : day.dayNumber}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800">{formatDate(day.date, 'EEE, MMM d')} · {day.theme}</p>
            <p className="text-xs text-slate-400">{day.city} · {weatherIcon} {day.weather.tempHighC}°/{day.weather.tempLowC}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{formatCurrency(day.estimatedCost, currency)}</span>
          {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 bg-slate-50/50">
              {/* Weather bar */}
              <div className="flex items-center gap-2 py-2 px-3 bg-white rounded-xl border border-slate-100 text-xs text-slate-600">
                <span className="text-base">{weatherIcon}</span>
                <span>{day.weather.description}</span>
                {day.weather.humidity != null && (
                  <span className="ml-auto text-slate-400">Humidity {day.weather.humidity}%</span>
                )}
              </div>

              {/* Periods */}
              {[day.morning, day.afternoon, day.evening].map(period => (
                <PeriodBlock key={period.label} period={period} />
              ))}

              {/* Meals */}
              {day.meals.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Utensils size={11} /> Where to eat</p>
                  <div className="space-y-1">
                    {day.meals.map(meal => (
                      <div key={meal.id} className="flex items-start gap-2 bg-white rounded-xl px-3 py-2 border border-slate-100">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">{meal.name}</p>
                          <p className="text-[11px] text-slate-500">{meal.cuisine} · {meal.priceRange} {meal.mustTryDish && `· Try: ${meal.mustTryDish}`}</p>
                        </div>
                        <span className="text-[10px] text-orange-500 font-medium flex-shrink-0 capitalize">{meal.mealType}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transport */}
              {day.transport.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Train size={11} /> Getting around</p>
                  {day.transport.map((t, i) => (
                    <div key={i} className="text-xs text-slate-600 bg-white rounded-xl px-3 py-2 border border-slate-100">
                      <span className="capitalize font-medium">{t.type}:</span> {t.description}
                      {t.cost && <span className="text-orange-500 ml-1">({t.cost})</span>}
                      {t.tip && <p className="text-[11px] text-slate-400 mt-0.5">💡 {t.tip}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Hidden gems & tips */}
              {(day.hiddenGems.length > 0 || day.insiderTips.length > 0) && (
                <div className="grid grid-cols-2 gap-2">
                  {day.hiddenGems.length > 0 && (
                    <div className="bg-purple-50 rounded-xl p-2.5 border border-purple-100">
                      <p className="text-[10px] font-bold text-purple-600 uppercase mb-1">💎 Hidden gems</p>
                      {day.hiddenGems.slice(0, 2).map((g, i) => (
                        <p key={i} className="text-[11px] text-purple-700">{g}</p>
                      ))}
                    </div>
                  )}
                  {day.insiderTips.length > 0 && (
                    <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-100">
                      <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">💡 Insider tips</p>
                      {day.insiderTips.slice(0, 2).map((t, i) => (
                        <p key={i} className="text-[11px] text-amber-700">{t}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Photo spots */}
              {day.photoSpots.length > 0 && (
                <div className="flex items-start gap-1.5">
                  <Camera size={11} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-slate-500">{day.photoSpots.join(' · ')}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PeriodBlock({ period }: { period: DayPeriod }) {
  const icons: Record<string, string> = { Morning: '🌅', Afternoon: '☀️', Evening: '🌙' };
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-slate-500">{icons[period.label] ?? '·'} {period.label}
        {period.walkingMinutes ? <span className="font-normal text-slate-400 ml-1">· {formatDurationMinutes(period.walkingMinutes)} walking</span> : null}
      </p>
      <div className="space-y-1">
        {period.activities.map(act => (
          <div key={act.id} className="bg-white rounded-xl px-3 py-2 border border-slate-100 flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800">{act.name}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">{act.description}</p>
            </div>
            <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
              <span className="text-[10px] text-slate-400">{act.duration}</span>
              {act.cost != null && <span className="text-[10px] text-orange-500 font-medium">{formatCurrency(act.cost, act.currency ?? 'EUR')}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

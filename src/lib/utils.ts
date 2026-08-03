// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

// ── Tailwind class merging ─────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── ID generation ──────────────────────────────────────────────────────────────
export function generateId(): string {
  return uuidv4();
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ── Date utilities ─────────────────────────────────────────────────────────────
export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatDateShort(date: string | Date): string {
  return formatDate(date, 'MMM d');
}

export function formatDateLong(date: string | Date): string {
  return formatDate(date, 'EEEE, MMMM d, yyyy');
}

export function formatDateRange(start: string, end: string): string {
  const s = parseISO(start);
  const e = parseISO(end);
  if (format(s, 'MMM yyyy') === format(e, 'MMM yyyy')) {
    return `${format(s, 'MMM d')}–${format(e, 'd, yyyy')}`;
  }
  return `${formatDateShort(s)} – ${formatDateShort(e)}, ${format(e, 'yyyy')}`;
}

export function calculateDuration(start: string, end: string): number {
  return differenceInDays(parseISO(end), parseISO(start));
}

export function addDaysToDate(date: string, days: number): string {
  return addDays(parseISO(date), days).toISOString().split('T')[0];
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isValidDate(dateStr: string): boolean {
  try {
    const d = parseISO(dateStr);
    return !isNaN(d.getTime());
  } catch {
    return false;
  }
}

// ── Currency / Number formatting ───────────────────────────────────────────────
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

export function formatCompactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ── Temperature ────────────────────────────────────────────────────────────────
export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function fToC(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

// ── Duration formatting ────────────────────────────────────────────────────────
export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function parsePTDuration(pt: string): number {
  // Parses ISO 8601 duration like PT2H30M → 150 minutes
  const match = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? '0', 10);
  const mins = parseInt(match[2] ?? '0', 10);
  return hours * 60 + mins;
}

export function formatPTDuration(pt: string): string {
  return formatDurationMinutes(parsePTDuration(pt));
}

// ── String utilities ───────────────────────────────────────────────────────────
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function titleCase(s: string): string {
  return s.replace(/\w\S*/g, w => capitalize(w));
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function truncate(s: string, maxLen: number): string {
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 3) + '…';
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + 's'}`;
}

// ── Array utilities ────────────────────────────────────────────────────────────
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as Pick<T, K>);
}

// ── Flight utilities ───────────────────────────────────────────────────────────
export function formatFlightTime(isoDatetime: string): string {
  return format(parseISO(isoDatetime), 'HH:mm');
}

export function formatStops(stops: number): string {
  if (stops === 0) return 'Direct';
  return pluralize(stops, 'stop');
}

// ── Rating ─────────────────────────────────────────────────────────────────────
export function ratingLabel(score: number, max = 10): string {
  const pct = score / max;
  if (pct >= 0.9) return 'Exceptional';
  if (pct >= 0.8) return 'Excellent';
  if (pct >= 0.7) return 'Very Good';
  if (pct >= 0.6) return 'Good';
  if (pct >= 0.5) return 'Okay';
  return 'Poor';
}

export function starRatingLabel(stars: number): string {
  const map: Record<number, string> = {
    1: 'Basic', 2: 'Economy', 3: 'Comfort', 4: 'Superior', 5: 'Luxury',
  };
  return map[stars] ?? 'Unknown';
}

// ── Delay ──────────────────────────────────────────────────────────────────────
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Local storage (safe) ───────────────────────────────────────────────────────
export function safeGetLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function safeSetLocalStorage(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // silently ignore quota errors
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Itinerary Types
// ─────────────────────────────────────────────────────────────────────────────

import type { Coordinates } from './destination';

export interface Itinerary {
  id: string;
  tripId: string;
  destination: string;
  destinationCode?: string;
  originCity: string;
  startDate: string;               // ISO date
  endDate: string;
  durationDays: number;
  travelers: TravelerCount;
  budget: BudgetBreakdown;
  days: ItineraryDay[];
  meta: ItineraryMeta;
  approved: boolean;
  version: number;                 // incremented on each regeneration
  generatedAt: string;
  packingList?: string[];
  transportDisclaimer: string;
}

export interface TravelerCount {
  adults: number;
  children: number;
  infants: number;
  total: number;
}

export interface BudgetBreakdown {
  total: number;
  currency: string;
  perPerson: number;
  flights?: number;
  accommodation?: number;
  activities?: number;
  food?: number;
  transport?: number;
  misc?: number;
  tier: import('./conversation').BudgetTier;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  date: string;                    // ISO date
  city: string;
  theme: string;                   // e.g. "Old Town & Waterfront"
  weather: DayWeather;
  morning: DayPeriod;
  afternoon: DayPeriod;
  evening: DayPeriod;
  meals: MealRecommendation[];
  transport: TransportNote[];
  hiddenGems: string[];
  photoSpots: string[];
  insiderTips: string[];
  estimatedCost: number;
  currency: string;
  accepted: boolean;              // partial acceptance tracking
  modified: boolean;
}

export interface DayPeriod {
  label: string;                  // 'Morning', 'Afternoon', 'Evening'
  activities: ItineraryActivity[];
  walkingMinutes?: number;
  notes?: string;
  indoorAlternatives?: string[];
}

export interface ItineraryActivity {
  id: string;
  name: string;
  description: string;
  type: ActivityCategory;
  duration: string;               // e.g. "2 hours"
  cost?: number;
  currency?: string;
  address?: string;
  coordinates?: Coordinates;
  openingHours?: string;
  bookingRequired?: boolean;
  rating?: number;
  nearbyAttractions?: string[];
  photoUrl?: string;
  tags?: string[];
}

export type ActivityCategory =
  | 'sightseeing'
  | 'museum'
  | 'food'
  | 'coffee'
  | 'shopping'
  | 'nature'
  | 'adventure'
  | 'culture'
  | 'entertainment'
  | 'relaxation'
  | 'transport'
  | 'photo'
  | 'local_experience';

export interface MealRecommendation {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'cafe';
  name: string;
  cuisine: string;
  description: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  address?: string;
  coordinates?: Coordinates;
  rating?: number;
  mustTryDish?: string;
  reservationRequired?: boolean;
  openingHours?: string;
}

export interface TransportNote {
  type: TransportType;
  description: string;
  duration?: string;
  cost?: string;
  tip?: string;
}

export type TransportType =
  | 'walk'
  | 'taxi'
  | 'metro'
  | 'bus'
  | 'tram'
  | 'uber'
  | 'ferry'
  | 'train'
  | 'rental_car'
  | 'airport_transfer';

export interface DayWeather {
  condition: WeatherCondition;
  tempHighC: number;
  tempLowC: number;
  description: string;
  icon: string;
  precipitation?: number;         // mm
  humidity?: number;              // %
  windKph?: number;
}

export type WeatherCondition =
  | 'sunny'
  | 'partly_cloudy'
  | 'cloudy'
  | 'overcast'
  | 'light_rain'
  | 'rain'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'snow'
  | 'fog'
  | 'windy';

export interface ItineraryMeta {
  interests: import('./conversation').TravelInterest[];
  travelerType: import('./conversation').TravelerType;
  accommodationType: import('./conversation').AccommodationType;
  walkingPreference: import('./conversation').WalkingPreference;
  highlights: string[];
  ariaRecommendation: string;
  safetyTips: string[];
  localCurrency: string;
  exchangeRate?: number;
  emergencyNumbers?: Record<string, string>;
  usefulApps?: string[];
}

export interface ItineraryEditRequest {
  itineraryId: string;
  type: EditType;
  dayId?: string;
  field?: string;
  newValue?: unknown;
  reason?: string;
}

export type EditType =
  | 'change_destination'
  | 'change_dates'
  | 'change_duration'
  | 'change_budget'
  | 'change_travelers'
  | 'change_interests'
  | 'replace_day_activity'
  | 'add_day_activity'
  | 'remove_day_activity'
  | 'replace_restaurant'
  | 'swap_morning_afternoon'
  | 'add_day'
  | 'remove_day';

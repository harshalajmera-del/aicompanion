// ─────────────────────────────────────────────────────────────────────────────
// Destination Types
// ─────────────────────────────────────────────────────────────────────────────

export type DestinationLevel =
  | 'continent'
  | 'region'
  | 'country'
  | 'state'
  | 'island'
  | 'city'
  | 'neighborhood';

export interface Destination {
  id: string;
  name: string;
  slug: string;
  level: DestinationLevel;
  country: string;
  countryCode: string;             // ISO 3166-1 alpha-2
  region?: string;
  continent: string;
  coordinates: Coordinates;
  airportCode?: string;
  description: string;
  tagline: string;
  imageUrl: string;
  thumbnailUrl?: string;
  highlights: string[];
  tags: string[];                  // beach, culture, adventure, food…
  bestMonths: number[];            // 1-12
  avgTemperatureC: Record<string, number>; // month -> temp
  currency: string;
  language: string[];
  timezone: string;
  visaRequired?: string[];         // country codes that need visa
  safetyRating?: number;           // 1-5
  budgetTier: import('./conversation').BudgetTier;
  children?: Destination[];        // sub-destinations
  parentId?: string;
  popularity?: number;             // 0-100
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DestinationSuggestion {
  destination: Destination;
  score: number;                   // match score 0-1
  reasons: string[];               // why Aria recommends it
  weatherNote?: string;
  budgetNote?: string;
}

export interface DestinationFilter {
  continent?: string;
  region?: string;
  budgetTier?: import('./conversation').BudgetTier;
  travelerType?: import('./conversation').TravelerType;
  interests?: import('./conversation').TravelInterest[];
  month?: number;
  durationDays?: number;
  climate?: ClimateType;
}

export type ClimateType =
  | 'tropical'
  | 'dry'
  | 'temperate'
  | 'continental'
  | 'polar';

export interface MapLocation {
  id: string;
  name: string;
  type: MapLocationType;
  coordinates: Coordinates;
  address?: string;
  rating?: number;
  priceLevel?: number;
  photoUrl?: string;
  openNow?: boolean;
  placeId?: string;
}

export type MapLocationType =
  | 'hotel'
  | 'restaurant'
  | 'attraction'
  | 'transport'
  | 'shopping'
  | 'nightlife'
  | 'nature';

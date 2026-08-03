// ─────────────────────────────────────────────────────────────────────────────
// Activity Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ActivitySearchParams {
  destination: string;
  startDate: string;              // YYYY-MM-DD
  endDate?: string;
  adults: number;
  children?: number;
  interests?: import('./conversation').TravelInterest[];
  currency?: string;
  maxResults?: number;
  itineraryDayId?: string;        // link to specific itinerary day
}

export interface ActivityOffer {
  id: string;
  provider: string;
  name: string;
  category: ActivityOfferCategory;
  subCategory?: string;
  description: string;
  shortDescription: string;
  highlights: string[];
  images: ActivityImage[];
  price: ActivityPrice;
  duration: ActivityDuration;
  groupSize: GroupSize;
  location: ActivityLocation;
  schedule: ActivitySchedule;
  inclusions: string[];
  exclusions: string[];
  requirements?: string[];
  cancellationPolicy: import('./hotel').CancellationPolicy;
  rating: ActivityRating;
  languages: string[];
  accessibility?: string;
  itineraryDayId?: string;        // maps to an itinerary day
  itineraryDayDate?: string;
  bookingUrl?: string;
  ariaNote?: string;
  searchedAt: string;
}

export type ActivityOfferCategory =
  | 'tour'
  | 'museum'
  | 'food_drink'
  | 'adventure'
  | 'cultural'
  | 'entertainment'
  | 'transfer'
  | 'ticket'
  | 'class'
  | 'cruise'
  | 'outdoor'
  | 'nightlife'
  | 'shopping'
  | 'wellness'
  | 'sports';

export interface ActivityImage {
  url: string;
  alt: string;
}

export interface ActivityPrice {
  adult: number;
  child?: number;
  currency: string;
  totalForGroup?: number;
  originalPrice?: number;
  discount?: number;
  includesTax: boolean;
}

export interface ActivityDuration {
  minutes: number;
  label: string;                  // '2 hours', 'Half day', 'Full day'
  flexible?: boolean;
}

export interface GroupSize {
  min?: number;
  max?: number;
  private?: boolean;
  label?: string;                 // 'Small group (max 8)'
}

export interface ActivityLocation {
  name: string;
  address?: string;
  coordinates?: import('./destination').Coordinates;
  meetingPoint?: string;
  endPoint?: string;
}

export interface ActivitySchedule {
  availableDates?: string[];
  daysOfWeek?: number[];          // 0=Sun, 6=Sat
  startTimes?: string[];          // '09:00', '14:00'
  nextAvailable?: string;
}

export interface ActivityRating {
  score: number;                  // 0-5
  reviewCount: number;
  label: string;
}

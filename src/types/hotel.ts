// ─────────────────────────────────────────────────────────────────────────────
// Hotel Types
// ─────────────────────────────────────────────────────────────────────────────

export interface HotelSearchParams {
  destination: string;            // city name or destination code
  destinationCode?: string;       // IATA or Amadeus city code
  checkIn: string;                // YYYY-MM-DD
  checkOut: string;
  adults: number;
  children?: number;
  rooms?: number;
  currency?: string;
  maxResults?: number;
  starRating?: number[];
  maxPricePerNight?: number;
  amenities?: HotelAmenity[];
}

export interface HotelOffer {
  id: string;
  provider: string;
  name: string;
  brand?: string;
  starRating: number;             // 1-5
  guestRating: GuestRating;
  neighborhood: string;
  address: HotelAddress;
  coordinates: import('./destination').Coordinates;
  images: HotelImage[];
  description: string;
  highlights: string[];
  amenities: HotelAmenity[];
  rooms: RoomOffer[];
  checkIn: string;
  checkOut: string;
  nights: number;
  cancellationPolicy: CancellationPolicy;
  mealPlan?: MealPlan;
  nearbyAttractions: NearbyAttraction[];
  walkabilityScore?: number;      // 0-100
  transitAccess?: string;
  ariaRecommendationNote?: string;
  bookingUrl?: string;
  searchedAt: string;
}

export interface GuestRating {
  overall: number;                // 0-10
  label: string;                  // 'Excellent', 'Very Good'…
  reviewCount: number;
  cleanliness?: number;
  comfort?: number;
  location?: number;
  facilities?: number;
  staff?: number;
}

export interface HotelAddress {
  street?: string;
  city: string;
  country: string;
  countryCode: string;
  postalCode?: string;
  fullAddress?: string;
}

export interface HotelImage {
  url: string;
  alt: string;
  category?: 'exterior' | 'room' | 'lobby' | 'pool' | 'restaurant' | 'view';
}

export interface RoomOffer {
  id: string;
  type: string;                   // 'Standard Double', 'Deluxe King'…
  description: string;
  maxOccupancy: number;
  bedType?: string;
  size?: string;
  amenities: string[];
  price: RoomPrice;
  available: boolean;
  boardType?: MealPlan;
  cancellationPolicy?: CancellationPolicy;
}

export interface RoomPrice {
  perNight: number;
  total: number;
  taxes: number;
  currency: string;
  originalPrice?: number;
  discount?: number;
}

export interface CancellationPolicy {
  type: 'free' | 'partial' | 'non-refundable';
  freeCancellationUntil?: string;
  penaltyAmount?: number;
  currency?: string;
  description: string;
}

export type MealPlan = 'room_only' | 'breakfast' | 'half_board' | 'full_board' | 'all_inclusive';

export type HotelAmenity =
  | 'wifi'
  | 'pool'
  | 'spa'
  | 'gym'
  | 'restaurant'
  | 'bar'
  | 'parking'
  | 'airport_shuttle'
  | 'room_service'
  | 'concierge'
  | 'laundry'
  | 'business_center'
  | 'pet_friendly'
  | 'accessible'
  | 'beach_access'
  | 'ski_in_out'
  | 'rooftop';

export interface NearbyAttraction {
  name: string;
  distance: string;               // e.g. "0.3 km"
  walkingMinutes?: number;
  type: string;
}

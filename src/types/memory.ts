// ─────────────────────────────────────────────────────────────────────────────
// Memory Engine Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MemoryState {
  sessionId: string;
  userId?: string;

  // User profile (learned over conversation)
  profile: UserProfile;

  // Active trip context
  trip: TripMemory;

  // Search history (avoid re-fetching)
  searches: SearchHistory;

  // Acceptance / rejection tracking
  preferences: PreferenceMemory;

  // Session metadata
  sessionStartedAt: string;
  lastActiveAt: string;
  messageCount: number;
  stage: import('./conversation').ConversationStage;
}

export interface UserProfile {
  name?: string;
  homeCity?: string;
  homeCurrency?: string;
  travelerType?: import('./conversation').TravelerType;
  interests: import('./conversation').TravelInterest[];
  budgetTier?: import('./conversation').BudgetTier;
  walkingPreference?: import('./conversation').WalkingPreference;
  accommodationPreference?: import('./conversation').AccommodationType;
  cabinClassPreference?: import('./conversation').CabinClass;
  dietaryRestrictions?: string[];
  languages?: string[];
}

export interface TripMemory {
  destination?: string;
  destinationHierarchy: string[];
  originCity?: string;
  startDate?: string;
  endDate?: string;
  durationDays?: number;
  adults: number;
  children: number;
  infants: number;
  budget?: number;
  currency: string;
  itineraryId?: string;
  itineraryApproved: boolean;
  selectedFlightId?: string;
  selectedHotelId?: string;
  selectedActivityIds: string[];
}

export interface SearchHistory {
  destinations: ViewedItem[];
  flights: ViewedItem[];
  hotels: ViewedItem[];
  activities: ViewedItem[];
}

export interface ViewedItem {
  id: string;
  name: string;
  viewedAt: string;
  selected?: boolean;
  rejected?: boolean;
}

export interface PreferenceMemory {
  acceptedSuggestions: string[];
  rejectedSuggestions: string[];
  acceptedItineraryDays: string[];
  modifiedItineraryDays: string[];
  preferredAirlines?: string[];
  preferredHotelBrands?: string[];
  avoidedActivities?: string[];
}

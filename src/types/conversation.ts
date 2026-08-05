// ─────────────────────────────────────────────────────────────────────────────
// Conversation & Chat Types
// ─────────────────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export type ConversationStage =
  | 'greeting'
  | 'discover'
  | 'narrow_destination'
  | 'plan'
  | 'collecting_details'
  | 'generating_itinerary'
  | 'refine_itinerary'
  | 'approve_itinerary'
  | 'search_flights'
  | 'select_flight'
  | 'search_hotels'
  | 'select_hotel'
  | 'search_activities'
  | 'select_activities'
  | 'trip_summary'
  | 'checkout'
  | 'completed';

export type MessageType =
  | 'text'
  | 'destination_cards'
  | 'destination_chips'
  | 'itinerary'
  | 'flight_results'
  | 'hotel_results'
  | 'activity_results'
  | 'trip_summary'
  | 'quick_replies'
  | 'date_picker'
  | 'budget_slider'
  | 'traveler_selector'
  | 'loading'
  | 'error';

export interface QuickReply {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  type: MessageType;
  timestamp: Date;
  metadata?: MessageMetadata;
  isStreaming?: boolean;
  quickReplies?: QuickReply[];
}

export interface MessageMetadata {
  destinations?: import('./destination').Destination[];
  itinerary?: import('./itinerary').Itinerary;
  flights?: import('./flight').FlightOffer[];
  hotels?: import('./hotel').HotelOffer[];
  activities?: import('./activity').ActivityOffer[];
  tripSummary?: import('./booking').TripSummary;
  stage?: ConversationStage;
  chips?: string[];
  error?: string;
}

export interface ConversationContext {
  sessionId: string;
  stage: ConversationStage;
  messages: ChatMessage[];
  tripContext: TripContext;
  pendingQuestion?: string;
  lastIntent?: string;
}

export interface TripContext {
  // Destination
  destinationQuery?: string;
  destinationHierarchy?: string[];   // e.g. ['Europe', 'Portugal', 'Lisbon']
  destinationConfirmed?: boolean;

  // Origin
  originCity?: string;
  originAirportCode?: string;

  // Dates
  departureDate?: string;            // ISO date string
  returnDate?: string;
  flexibleMonth?: string;            // e.g. 'September 2025'
  durationDays?: number;

  // Travelers
  adults?: number;
  children?: number;
  infants?: number;
  travelerType?: TravelerType;

  // Budget
  budget?: number;
  budgetCurrency?: string;
  budgetTier?: BudgetTier;

  // Preferences
  interests?: TravelInterest[];
  accommodationType?: AccommodationType;
  cabinClass?: CabinClass;
  walkingPreference?: WalkingPreference;
  dietaryPreferences?: string[];

  // State tracking
  itinerary?: import('./itinerary').Itinerary;
  itineraryApproved?: boolean;
  selectedFlight?: import('./flight').FlightOffer;
  selectedHotel?: import('./hotel').HotelOffer;
  selectedActivities?: import('./activity').ActivityOffer[];
}

export type TravelerType = 'solo' | 'couple' | 'family' | 'group' | 'business';
export type BudgetTier = 'budget' | 'moderate' | 'luxury' | 'ultra-luxury';
export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';
export type WalkingPreference = 'minimal' | 'moderate' | 'extensive';
export type AccommodationType = 'hotel' | 'boutique' | 'hostel' | 'apartment' | 'resort' | 'villa';

export type TravelInterest =
  | 'adventure'
  | 'culture'
  | 'food'
  | 'nature'
  | 'nightlife'
  | 'shopping'
  | 'relaxation'
  | 'history'
  | 'art'
  | 'sports'
  | 'wellness'
  | 'photography'
  | 'luxury'
  | 'beach'
  | 'mountains';

export type Intent =
  | 'greet'
  | 'discover_destination'
  | 'narrow_destination'
  | 'provide_origin'      
  | 'provide_duration'  
  | 'provide_dates'
  | 'provide_budget'
  | 'provide_travelers'
  | 'provide_interests'
  | 'request_itinerary'
  | 'modify_itinerary'
  | 'approve_itinerary'
  | 'search_flights'
  | 'select_flight'
  | 'search_hotels'
  | 'select_hotel'
  | 'search_activities'
  | 'select_activity'
  | 'view_summary'
  | 'checkout'
  | 'ask_question'
  | 'unknown';

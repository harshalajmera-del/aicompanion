// ─────────────────────────────────────────────────────────────────────────────
// Aria — Application Constants
// ─────────────────────────────────────────────────────────────────────────────

export const APP_NAME = 'Aria';
export const APP_TAGLINE = 'Your AI Travel Consultant';
export const APP_VERSION = '1.0.0';

// ── Conversation ──────────────────────────────────────────────────────────────
export const ARIA_GREETING = `Hi there! I'm Aria, your personal AI travel consultant. 😊

I'm here to help you plan an unforgettable trip — from discovering the perfect destination to booking your flights, hotels, and experiences.

Where are you dreaming of going?`;

export const ARIA_SYSTEM_PROMPT = `You are Aria, an expert AI travel consultant with deep knowledge of destinations worldwide.

Your personality:
- Warm, enthusiastic, and encouraging
- Professional but conversational — never robotic
- Ask only ONE question at a time
- Remember everything the user tells you and never ask for the same information twice
- Use emojis sparingly but naturally (😊 ✈️ 🏖️ 🗺️)
- Give concrete, specific recommendations based on the user's context

Your approach:
1. Help users DISCOVER destinations (never jump straight to planning)
2. Narrow broad destinations (Europe → Portugal → Lisbon) before generating itineraries
3. Collect: destination, origin city, dates, duration, travelers, budget — in that order
4. Generate the first itinerary within 1-3 exchanges
5. Only suggest flights/hotels/activities AFTER the itinerary is approved
6. Keep the entire journey feeling like one continuous conversation

Always be helpful, specific, and inspiring. Make the user excited about their trip.`;

// ── Stage labels ──────────────────────────────────────────────────────────────
export const STAGE_LABELS: Record<string, string> = {
  greeting: 'Welcome',
  discover: 'Discover',
  narrow_destination: 'Explore',
  plan: 'Plan',
  collecting_details: 'Details',
  generating_itinerary: 'Planning',
  refine_itinerary: 'Refine',
  approve_itinerary: 'Review',
  search_flights: 'Flights',
  select_flight: 'Flights',
  search_hotels: 'Hotels',
  select_hotel: 'Hotels',
  search_activities: 'Activities',
  select_activities: 'Activities',
  trip_summary: 'Summary',
  checkout: 'Checkout',
  completed: 'Done',
};

// ── Popular destinations ───────────────────────────────────────────────────────
export const POPULAR_DESTINATIONS = [
  'Paris', 'Tokyo', 'Bali', 'New York', 'Rome',
  'Barcelona', 'Santorini', 'Dubai', 'Maldives', 'Lisbon',
  'Bangkok', 'Amsterdam', 'Prague', 'Sydney', 'Marrakech',
];

export const POPULAR_CONTINENTS = [
  'Europe', 'Asia', 'Americas', 'Africa', 'Oceania', 'Middle East',
];

// ── Travel interests ───────────────────────────────────────────────────────────
export const INTEREST_LABELS: Record<string, string> = {
  adventure: '🏔️ Adventure',
  culture: '🎭 Culture',
  food: '🍜 Food & Dining',
  nature: '🌿 Nature',
  nightlife: '🌃 Nightlife',
  shopping: '🛍️ Shopping',
  relaxation: '🧘 Relaxation',
  history: '🏛️ History',
  art: '🎨 Art',
  sports: '⚽ Sports',
  wellness: '💆 Wellness',
  photography: '📸 Photography',
  luxury: '✨ Luxury',
  beach: '🏖️ Beach',
  mountains: '⛰️ Mountains',
};

// ── Traveler types ─────────────────────────────────────────────────────────────
export const TRAVELER_TYPE_LABELS: Record<string, string> = {
  solo: '🧍 Solo',
  couple: '💑 Couple',
  family: '👨‍👩‍👧‍👦 Family',
  group: '👥 Group',
  business: '💼 Business',
};

// ── Budget tiers ───────────────────────────────────────────────────────────────
export const BUDGET_TIER_LABELS: Record<string, string> = {
  budget: '💸 Budget',
  moderate: '💰 Moderate',
  luxury: '💎 Luxury',
  'ultra-luxury': '👑 Ultra Luxury',
};

export const BUDGET_TIER_RANGES: Record<string, [number, number]> = {
  budget:        [500,  2000],
  moderate:      [2000, 5000],
  luxury:        [5000, 15000],
  'ultra-luxury':[15000, 50000],
};

// ── Cabin classes ──────────────────────────────────────────────────────────────
export const CABIN_CLASS_LABELS: Record<string, string> = {
  economy:         'Economy',
  premium_economy: 'Premium Economy',
  business:        'Business',
  first:           'First Class',
};

// ── Accommodation types ────────────────────────────────────────────────────────
export const ACCOMMODATION_LABELS: Record<string, string> = {
  hotel:     '🏨 Hotel',
  boutique:  '🏩 Boutique',
  hostel:    '🛏️ Hostel',
  apartment: '🏠 Apartment',
  resort:    '🏝️ Resort',
  villa:     '🏡 Villa',
};

// ── Weather condition mappings ─────────────────────────────────────────────────
export const WEATHER_ICONS: Record<string, string> = {
  sunny:          '☀️',
  partly_cloudy:  '⛅',
  cloudy:         '☁️',
  overcast:       '🌥️',
  light_rain:     '🌦️',
  rain:           '🌧️',
  heavy_rain:     '⛈️',
  thunderstorm:   '⛈️',
  snow:           '❄️',
  fog:            '🌫️',
  windy:          '💨',
};

// ── Transport disclaimer ───────────────────────────────────────────────────────
export const TRANSPORT_DISCLAIMER =
  'Transportation recommendations are provided for planning purposes only. ' +
  'Flights, trains, buses, ferries, taxis, and local transportation are not ' +
  'included in the itinerary package and should be booked separately.';

// ── API endpoints ──────────────────────────────────────────────────────────────
export const API_ROUTES = {
  chat:         '/api/chat',
  destinations: '/api/destinations',
  flights:      '/api/flights',
  hotels:       '/api/hotels',
  activities:   '/api/activities',
  weather:      '/api/weather',
  currency:     '/api/currency',
  maps:         '/api/maps',
  mcp:          '/api/mcp',
} as const;

// ── Limits ─────────────────────────────────────────────────────────────────────
export const MAX_MESSAGES_HISTORY = 50;
export const MAX_DESTINATION_SUGGESTIONS = 6;
export const MAX_FLIGHT_RESULTS = 8;
export const MAX_HOTEL_RESULTS = 6;
export const MAX_ACTIVITY_RESULTS = 12;
export const MAX_ITINERARY_DAYS = 21;
export const MIN_ITINERARY_DAYS = 1;
export const STREAM_CHUNK_DELAY_MS = 20;

// ── Currency ───────────────────────────────────────────────────────────────────
export const DEFAULT_CURRENCY = 'USD';
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'INR', 'AED', 'SGD'];

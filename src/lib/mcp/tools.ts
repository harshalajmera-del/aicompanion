// ─────────────────────────────────────────────────────────────────────────────
// MCP Tool Definitions
// Exposed as structured tool calls to the AI SDK / LLM orchestration layer.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

// ── Schema helpers ─────────────────────────────────────────────────────────────
export const destinationQuerySchema = z.object({
  query: z.string().describe('Destination query — city, country, region, or interest (e.g. "beach vacation in Europe")'),
  budgetTier: z.enum(['budget', 'moderate', 'luxury', 'ultra-luxury']).optional(),
  travelerType: z.enum(['solo', 'couple', 'family', 'group', 'business']).optional(),
  interests: z.array(z.string()).optional(),
  month: z.number().min(1).max(12).optional().describe('Travel month (1-12)'),
  durationDays: z.number().optional(),
});

export const itinerarySchema = z.object({
  destination: z.string(),
  originCity: z.string(),
  startDate: z.string().describe('ISO date YYYY-MM-DD'),
  endDate: z.string().describe('ISO date YYYY-MM-DD'),
  durationDays: z.number().min(1).max(21),
  adults: z.number().min(1),
  children: z.number().default(0),
  budget: z.number().describe('Total budget in USD'),
  currency: z.string().default('USD'),
  interests: z.array(z.string()).optional(),
  travelerType: z.enum(['solo', 'couple', 'family', 'group', 'business']).optional(),
  accommodationType: z.enum(['hotel', 'boutique', 'hostel', 'apartment', 'resort', 'villa']).optional(),
  budgetTier: z.enum(['budget', 'moderate', 'luxury', 'ultra-luxury']).optional(),
});

export const flightSearchSchema = z.object({
  origin: z.string().describe('IATA airport code (e.g. JFK)'),
  destination: z.string().describe('IATA airport code (e.g. CDG)'),
  departureDate: z.string().describe('YYYY-MM-DD'),
  returnDate: z.string().optional().describe('YYYY-MM-DD for round trips'),
  adults: z.number().min(1),
  children: z.number().default(0),
  cabinClass: z.enum(['economy', 'premium_economy', 'business', 'first']).default('economy'),
  currency: z.string().default('USD'),
});

export const hotelSearchSchema = z.object({
  destination: z.string(),
  checkIn: z.string().describe('YYYY-MM-DD'),
  checkOut: z.string().describe('YYYY-MM-DD'),
  adults: z.number().min(1),
  children: z.number().default(0),
  currency: z.string().default('USD'),
  starRating: z.array(z.number().min(1).max(5)).optional(),
});

export const activitySearchSchema = z.object({
  destination: z.string(),
  startDate: z.string().describe('YYYY-MM-DD'),
  endDate: z.string().optional(),
  adults: z.number().min(1),
  children: z.number().default(0),
  interests: z.array(z.string()).optional(),
  itineraryDayId: z.string().optional(),
});

export const weatherSchema = z.object({
  location: z.string().describe('City name or destination'),
  date: z.string().optional().describe('YYYY-MM-DD — start date for forecast'),
});

export const currencySchema = z.object({
  amount: z.number(),
  from: z.string().describe('Source currency code (e.g. USD)'),
  to: z.string().describe('Target currency code (e.g. EUR)'),
});

export const destinationInfoSchema = z.object({
  destination: z.string(),
});

export const budgetOptimizerSchema = z.object({
  destination: z.string(),
  totalBudget: z.number(),
  currency: z.string().default('USD'),
  durationDays: z.number(),
  travelers: z.number(),
  tier: z.enum(['budget', 'moderate', 'luxury', 'ultra-luxury']),
});

// ── Tool catalogue ─────────────────────────────────────────────────────────────
export const MCP_TOOLS = {
  suggest_destinations: {
    description: 'Suggest travel destinations based on user preferences, budget, and travel style',
    schema: destinationQuerySchema,
  },
  plan_itinerary: {
    description: 'Generate a detailed day-by-day travel itinerary including morning/afternoon/evening activities, restaurants, transport, weather, and tips',
    schema: itinerarySchema,
  },
  regenerate_itinerary: {
    description: 'Partially regenerate specific days of an existing itinerary while preserving accepted days',
    schema: itinerarySchema.extend({
      existingItineraryId: z.string(),
      regenerateDayIds: z.array(z.string()).optional(),
    }),
  },
  search_flights: {
    description: 'Search for available flights between two airports on specific dates',
    schema: flightSearchSchema,
  },
  search_hotels: {
    description: 'Search for available hotels at a destination for specific dates',
    schema: hotelSearchSchema,
  },
  search_activities: {
    description: 'Search for tours, experiences, and activities at a destination',
    schema: activitySearchSchema,
  },
  weather_lookup: {
    description: 'Get current weather and 10-day forecast for a destination',
    schema: weatherSchema,
  },
  currency_converter: {
    description: 'Convert an amount between currencies using current exchange rates',
    schema: currencySchema,
  },
  destination_information: {
    description: 'Get detailed information about a destination including highlights, tips, and recommendations',
    schema: destinationInfoSchema,
  },
  budget_optimizer: {
    description: 'Optimise budget allocation across flights, hotels, activities, food, and transport for a trip',
    schema: budgetOptimizerSchema,
  },
  maps_search: {
    description: 'Search for points of interest, restaurants, and attractions near a location',
    schema: z.object({
      location: z.string(),
      type: z.string().optional(),
      radius: z.number().optional().describe('Search radius in metres'),
    }),
  },
  travel_context: {
    description: 'Get the current conversation context including all trip details collected so far',
    schema: z.object({}),
  },
} as const;

export type MCPToolName = keyof typeof MCP_TOOLS;

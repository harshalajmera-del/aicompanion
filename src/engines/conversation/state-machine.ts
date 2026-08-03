// ─────────────────────────────────────────────────────────────────────────────
// Conversation State Machine
// Determines the next stage based on current stage + intent + trip completeness.
// ─────────────────────────────────────────────────────────────────────────────

import type { ConversationStage, Intent } from '@/types/conversation';
import type { TripMemory } from '@/types/memory';

interface TransitionInput {
  currentStage: ConversationStage;
  intent: Intent;
  trip: TripMemory;
}

interface TransitionResult {
  nextStage: ConversationStage;
  missingFields: MissingField[];
  shouldGenerateItinerary: boolean;
  shouldSearchFlights: boolean;
  shouldSearchHotels: boolean;
  shouldSearchActivities: boolean;
}

export interface MissingField {
  field: keyof TripMemory | 'interests';
  question: string;
  type: 'text' | 'date_picker' | 'budget_slider' | 'traveler_selector' | 'chips' | 'cards';
  options?: string[];
}

// ── What fields are required before generating an itinerary ───────────────────
function getMissingFields(trip: TripMemory): MissingField[] {
  const missing: MissingField[] = [];

  if (!trip.destination) {
    missing.push({
      field: 'destination',
      question: "That sounds exciting! 😊 Where are you thinking of going?",
      type: 'text',
    });
  }
  if (!trip.originCity) {
    missing.push({
      field: 'originCity',
      question: "And which city will you be flying from?",
      type: 'text',
    });
  }
  if (!trip.startDate && !trip.durationDays) {
    missing.push({
      field: 'startDate',
      question: "When are you planning to travel? Do you have specific dates, or are you flexible?",
      type: 'date_picker',
    });
  }
  if (!trip.durationDays && trip.startDate && !trip.endDate) {
    missing.push({
      field: 'durationDays',
      question: "How many days are you planning for this trip?",
      type: 'text',
    });
  }
  if (!trip.adults || trip.adults < 1) {
    missing.push({
      field: 'adults',
      question: "Who's joining you on this adventure? Just you, or will others be travelling too?",
      type: 'traveler_selector',
    });
  }
  if (!trip.budget) {
    missing.push({
      field: 'budget',
      question: "What's your approximate budget for the entire trip? (Including flights and accommodation)",
      type: 'budget_slider',
    });
  }

  return missing;
}

// ── Transition table ───────────────────────────────────────────────────────────
export function transition(input: TransitionInput): TransitionResult {
  const { currentStage, intent, trip } = input;

  const result: TransitionResult = {
    nextStage: currentStage,
    missingFields: [],
    shouldGenerateItinerary: false,
    shouldSearchFlights: false,
    shouldSearchHotels: false,
    shouldSearchActivities: false,
  };

  switch (intent) {
    case 'greet':
      result.nextStage = 'discover';
      break;

    case 'discover_destination':
      if (trip.destination) {
        // Has destination — check if broad (needs narrowing) or specific
        result.nextStage = 'narrow_destination';
      } else {
        result.nextStage = 'discover';
      }
      break;

    case 'narrow_destination':
      // User narrowed destination — start collecting plan details
      result.nextStage = 'collecting_details';
      result.missingFields = getMissingFields(trip);
      break;

    case 'provide_dates':
    case 'provide_budget':
    case 'provide_travelers':
    case 'provide_interests': {
      const missing = getMissingFields(trip);
      if (missing.length === 0) {
        result.nextStage = 'generating_itinerary';
        result.shouldGenerateItinerary = true;
      } else {
        result.nextStage = 'collecting_details';
        result.missingFields = missing;
      }
      break;
    }

    case 'request_itinerary': {
      const missingForItinerary = getMissingFields(trip);
      if (missingForItinerary.length === 0) {
        result.nextStage = 'generating_itinerary';
        result.shouldGenerateItinerary = true;
      } else {
        result.nextStage = 'collecting_details';
        result.missingFields = missingForItinerary;
      }
      break;
    }

    case 'modify_itinerary':
      result.nextStage = 'refine_itinerary';
      break;

    case 'approve_itinerary':
      result.nextStage = 'search_flights';
      result.shouldSearchFlights = true;
      break;

    case 'search_flights':
      result.nextStage = 'search_flights';
      result.shouldSearchFlights = true;
      break;

    case 'select_flight':
      result.nextStage = 'search_hotels';
      result.shouldSearchHotels = true;
      break;

    case 'search_hotels':
      result.nextStage = 'search_hotels';
      result.shouldSearchHotels = true;
      break;

    case 'select_hotel':
      result.nextStage = 'search_activities';
      result.shouldSearchActivities = true;
      break;

    case 'search_activities':
      result.nextStage = 'search_activities';
      result.shouldSearchActivities = true;
      break;

    case 'select_activity':
      result.nextStage = 'select_activities';
      break;

    case 'view_summary':
      result.nextStage = 'trip_summary';
      break;

    case 'checkout':
      result.nextStage = 'checkout';
      break;

    case 'ask_question':
    default:
      // Stay in current stage but respond to the question
      result.nextStage = currentStage;
      break;
  }

  // Override: if itinerary exists and approved, skip backward progression
  if (trip.itineraryApproved) {
    const bookingStages: ConversationStage[] = [
      'search_flights', 'select_flight',
      'search_hotels', 'select_hotel',
      'search_activities', 'select_activities',
      'trip_summary', 'checkout',
    ];
    if (!bookingStages.includes(result.nextStage)) {
      result.nextStage = currentStage;
    }
  }

  return result;
}

// ── Progress calculation ───────────────────────────────────────────────────────
export function getStageProgress(stage: ConversationStage): number {
  const stageOrder: ConversationStage[] = [
    'greeting', 'discover', 'narrow_destination',
    'plan', 'collecting_details', 'generating_itinerary',
    'refine_itinerary', 'approve_itinerary',
    'search_flights', 'select_flight',
    'search_hotels', 'select_hotel',
    'search_activities', 'select_activities',
    'trip_summary', 'checkout', 'completed',
  ];
  const idx = stageOrder.indexOf(stage);
  return idx < 0 ? 0 : Math.round((idx / (stageOrder.length - 1)) * 100);
}

// ── Breadcrumb stages for the UI ───────────────────────────────────────────────
export const STAGE_BREADCRUMBS = [
  { id: 'discover',      label: 'Discover',    stages: ['greeting', 'discover', 'narrow_destination'] },
  { id: 'plan',          label: 'Plan',         stages: ['plan', 'collecting_details', 'generating_itinerary', 'refine_itinerary', 'approve_itinerary'] },
  { id: 'flights',       label: 'Flights',      stages: ['search_flights', 'select_flight'] },
  { id: 'hotels',        label: 'Hotels',       stages: ['search_hotels', 'select_hotel'] },
  { id: 'activities',    label: 'Activities',   stages: ['search_activities', 'select_activities'] },
  { id: 'book',          label: 'Book',         stages: ['trip_summary', 'checkout', 'completed'] },
] as const;

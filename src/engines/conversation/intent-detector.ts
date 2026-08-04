// ─────────────────────────────────────────────────────────────────────────────
// Intent Detector
// Classifies user messages into structured intents using keyword + pattern rules.
// Falls back to LLM classification for ambiguous inputs.
// ─────────────────────────────────────────────────────────────────────────────

import type { Intent, ConversationStage } from '@/types/conversation';

interface DetectedIntent {
  intent: Intent;
  confidence: number;           // 0–1
  extracted: ExtractedEntities;
}

export interface ExtractedEntities {
  destination?: string;
  originCity?: string;
  dates?: { start?: string; end?: string };
  durationDays?: number;
  adults?: number;
  children?: number;
  budget?: number;
  currency?: string;
  cabinClass?: string;
  interests?: string[];
  travelerType?: string;
  accommodationType?: string;
  itineraryChange?: string;
  dayNumber?: number;
  activityType?: string;
}

// ── Pattern maps ───────────────────────────────────────────────────────────────
const GREETING_PATTERNS = [
  /^(hi|hello|hey|good\s*(morning|afternoon|evening)|howdy|greetings)/i,
  /^(start|begin|let'?s\s*go|let\s*me\s*plan)/i,
];

const DESTINATION_PATTERNS = [
  /\b(i\s*(want|would like|am planning|am thinking)\s*(to\s*)?(go|travel|visit|explore|see))\b/i,
  /\b(take\s*me|send\s*me|let'?s\s*go)\s*(to|in)\b/i,
  /\b(destination|where|country|city|place|spot)\b/i,
  /\b(beach|mountain|city trip|adventure|relaxing|romantic)\s*(vacation|trip|holiday|getaway)\b/i,
];

const DATE_PATTERNS = [
  /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
  /\b(jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/i,
  /\b\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?\b/,
  /\b(next|this|coming)\s+(week|month|year|summer|winter|spring|fall|autumn)\b/i,
  /\b(in\s+)?\d+\s*(days?|weeks?|months?)\b/i,
  /\bflexible\b/i,
];

const DURATION_PATTERNS = [
  /\b(\d+)\s*(day|night|week|fortnight)\b/i,
  /\b(one|two|three|four|five|six|seven|eight|nine|ten)\s*(day|night|week)\b/i,
  /\b(long\s*weekend|weekend)\b/i,
];

const BUDGET_PATTERNS = [
  /\$\s*[\d,]+/,
  /\b[\d,]+\s*(dollar|usd|eur|gbp|euro|pound)\b/i,
  /\b(budget|cheap|affordable|mid-?range|moderate|luxury|splurge|backpack)/i,
  /\b(spend|budget|cost|price)\b.*\b(\d[\d,]*)\b/i,
];

const TRAVELER_PATTERNS = [
  /\b(\d+)\s*(adult|person|people|travell?er|pax)\b/i,
  /\b(solo|alone|myself|just me)\b/i,
  /\b(couple|partner|wife|husband|boyfriend|girlfriend)\b/i,
  /\b(family|kid|child|children|son|daughter)\b/i,
  /\b(group|friends|colleagues)\b/i,
];

const APPROVE_PATTERNS = [
  /\b(look(s)?\s*(great|good|perfect|amazing|awesome)|love\s*it|that'?s\s*(perfect|great|good))\b/i,
  /\b(approve|accept|confirm|go\s*(with|ahead)|yes|yeah|perfect|book\s*it|let'?s\s*do\s*it)\b/i,
  /\b(i'?m\s*happy|i\s*like\s*it|that\s*works|proceed)\b/i,
];

const MODIFY_PATTERNS = [
  /\b(change|modify|update|edit|swap|replace|different|instead|rather|prefer)\b/i,
  /\b(too\s*(expensive|cheap|long|short|busy|quiet))\b/i,
  /\b(add|include|remove|exclude|skip|drop)\b/i,
  /\b(more\s*(time|budget|days)|less\s*(time|budget|days))\b/i,
];

const FLIGHT_PATTERNS = [
  /\b(flight|fly|flying|airline|airport|depart|return\s*flight)\b/i,
  /\b(search\s*flights|find\s*(me\s*)?a\s*flight|book\s*flight)\b/i,
];

const HOTEL_PATTERNS = [
  /\b(hotel|accommodation|stay|lodge|hostel|resort|airbnb|place\s*to\s*stay)\b/i,
  /\b(search\s*hotels|find\s*(me\s*)?a\s*hotel|book\s*(a\s*)?(hotel|room))\b/i,
];

const ACTIVITY_PATTERNS = [
  /\b(activit|experience|tour|excursion|thing(s)?\s*to\s*do|attraction|museum|show|ticket)\b/i,
  /\b(book\s*(an?\s*)?(activity|tour|experience))\b/i,
];

// ── Duration text → number ──────────────────────────────────────────────────────
const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};

function extractDuration(text: string): number | undefined {
  const m = text.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(day|night|week)\b/i);
  if (!m) {
    if (/\blong\s*weekend\b/i.test(text)) return 3;
    if (/\bweekend\b/i.test(text)) return 2;
    return undefined;
  }
  const raw = m[1].toLowerCase();
  const n = WORD_NUMBERS[raw] ?? parseInt(raw, 10);
  const unit = m[2].toLowerCase();
  if (unit === 'week') return n * 7;
  return n;
}

function extractBudget(text: string): { amount?: number; currency?: string } {
  const dollarMatch = text.match(/\$\s*([\d,]+)/);
  if (dollarMatch) return { amount: parseInt(dollarMatch[1].replace(/,/g, ''), 10), currency: 'USD' };

  const wordMatch = text.match(/\b([\d,]+)\s*(dollar|usd)\b/i);
  if (wordMatch) return { amount: parseInt(wordMatch[1].replace(/,/g, ''), 10), currency: 'USD' };

  const euroMatch = text.match(/€\s*([\d,]+)|([\d,]+)\s*(euro|eur)\b/i);
  if (euroMatch) {
    const raw = euroMatch[1] ?? euroMatch[2];
    return { amount: parseInt(raw.replace(/,/g, ''), 10), currency: 'EUR' };
  }

  return {};
}

function extractTravelers(text: string): { adults?: number; children?: number; travelerType?: string } {
  if (/\b(solo|alone|myself|just me)\b/i.test(text)) return { adults: 1, travelerType: 'solo' };
  if (/\b(couple|partner|wife|husband|boyfriend|girlfriend)\b/i.test(text)) return { adults: 2, travelerType: 'couple' };

  const m = text.match(/\b(\d+)\s*(adult|person|people|travell?er|pax)\b/i);
  const adults = m ? parseInt(m[1], 10) : undefined;

  const cm = text.match(/\b(\d+)\s*(child|kid|children)\b/i);
  const children = cm ? parseInt(cm[1], 10) : undefined;

  let travelerType: string | undefined;
  if (/\b(family|kid|child)\b/i.test(text)) travelerType = 'family';
  else if (/\b(group|friends)\b/i.test(text)) travelerType = 'group';
  else if (/\b(business)\b/i.test(text)) travelerType = 'business';

  return { adults, children, travelerType };
}

// ── Core detector ───────────────────────────────────────────────────────────────
export function detectIntent(
  text: string,
  currentStage: ConversationStage,
): DetectedIntent {
  const lower = text.toLowerCase().trim();
  const entities: ExtractedEntities = {};

  // Extract destination
  const destination = extractDestination(text);

  if (destination) {
    entities.destination = destination;
  }

  // Extract entities regardless of intent
  const duration = extractDuration(text);
  if (duration) entities.durationDays = duration;

  const budget = extractBudget(text);
  if (budget.amount) entities.budget = budget.amount;
  if (budget.currency) entities.currency = budget.currency;

  const travelers = extractTravelers(text);
  if (travelers.adults) entities.adults = travelers.adults;
  if (travelers.children) entities.children = travelers.children;
  if (travelers.travelerType) entities.travelerType = travelers.travelerType;

// ── Detect primary intent by stage context + patterns ──────────────────────

  // Greeting
  if (GREETING_PATTERNS.some(p => p.test(lower))) {
    return { intent: 'greet', confidence: 0.95, extracted: entities };
  }

  // Approve itinerary (high priority)
  if (APPROVE_PATTERNS.some(p => p.test(lower)) &&
      ['refine_itinerary', 'approve_itinerary', 'generating_itinerary'].includes(currentStage)) {
    return { intent: 'approve_itinerary', confidence: 0.9, extracted: entities };
  }

  // Modify itinerary
  if (MODIFY_PATTERNS.some(p => p.test(lower)) &&
      ['refine_itinerary', 'approve_itinerary', 'generating_itinerary'].includes(currentStage)) {
    entities.itineraryChange = text;
    return { intent: 'modify_itinerary', confidence: 0.85, extracted: entities };
  }

  // Flight intent
  if (FLIGHT_PATTERNS.some(p => p.test(lower))) {
    return { intent: 'search_flights', confidence: 0.88, extracted: entities };
  }

  // Hotel intent
  if (HOTEL_PATTERNS.some(p => p.test(lower)) && !FLIGHT_PATTERNS.some(p => p.test(lower))) {
    return { intent: 'search_hotels', confidence: 0.88, extracted: entities };
  }

  // Activity intent
  if (ACTIVITY_PATTERNS.some(p => p.test(lower))) {
    return { intent: 'search_activities', confidence: 0.85, extracted: entities };
  }

  // Date / duration provision
  if (DATE_PATTERNS.some(p => p.test(lower)) || DURATION_PATTERNS.some(p => p.test(lower))) {
    if (entities.durationDays) return { intent: 'provide_dates', confidence: 0.8, extracted: entities };
    return { intent: 'provide_dates', confidence: 0.75, extracted: entities };
  }

  // Budget provision
  if (BUDGET_PATTERNS.some(p => p.test(lower))) {
    return { intent: 'provide_budget', confidence: 0.82, extracted: entities };
  }

  // Travelers
  if (TRAVELER_PATTERNS.some(p => p.test(lower))) {
    return { intent: 'provide_travelers', confidence: 0.82, extracted: entities };
  }

  // Continue planning
  if (
  /plan the trip|plan my trip|plan trip|continue|next|go ahead|start planning|create itinerary|generate itinerary/i.test(lower)
  ) {
  return {
    intent: 'request_itinerary',
    confidence: 0.95,
    extracted: entities,
  };
}

  // Stage-specific fallbacks
  switch (currentStage) {
    case 'greeting':
    case 'discover':
      if (DESTINATION_PATTERNS.some(p => p.test(lower)) || lower.length > 3) {
        return { intent: 'discover_destination', confidence: 0.7, extracted: entities };
      }
      break;

    case 'narrow_destination':
      return { intent: 'narrow_destination', confidence: 0.75, extracted: entities };

case 'collecting_details': {

  if (entities.originCity) {
    return {
      intent: 'provide_dates',
      confidence: 0.9,
      extracted: entities,
    };
  }

  if (entities.durationDays) {
    return {
      intent: 'provide_dates',
      confidence: 0.9,
      extracted: entities,
    };
  }

  if (entities.adults || entities.children) {
    return {
      intent: 'provide_travelers',
      confidence: 0.9,
      extracted: entities,
    };
  }

  if (entities.budget) {
    return {
      intent: 'provide_budget',
      confidence: 0.9,
      extracted: entities,
    };
  }

  return {
    intent: 'request_itinerary',
    confidence: 0.8,
    extracted: entities,
  };
}
}
    case 'refine_itinerary':
    case 'approve_itinerary':
      if (APPROVE_PATTERNS.some(p => p.test(lower))) {
        return { intent: 'approve_itinerary', confidence: 0.88, extracted: entities };
      }
      return { intent: 'modify_itinerary', confidence: 0.65, extracted: { ...entities, itineraryChange: text } };
  }

// Final fallback
if (currentStage === 'narrow_destination') {
  return {
    intent: 'narrow_destination',
    confidence: 0.9,
    extracted: entities,
  };
}

if (['greeting', 'discover', 'plan'].includes(currentStage)) {
  return {
    intent: 'discover_destination',
    confidence: 0.55,
    extracted: entities,
  };
}

return {
  intent: 'ask_question',
  confidence: 0.5,
  extracted: entities,
};

}
const DESTINATIONS = [
  "goa",
  "bali",
  "dubai",
  "singapore",
  "paris",
  "tokyo",
  "london",
  "maldives",
  "kerala",
  "manali",
  "jaipur",
  "mumbai",
  "delhi",
  "bangalore",
  "new york",
  "switzerland",
];

function extractDestination(text: string): string | undefined {
  const lower = text.toLowerCase();

  const found = DESTINATIONS.find(city =>
    lower.includes(city)
  );

  if (!found) return undefined;

  return found
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

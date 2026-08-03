// ─────────────────────────────────────────────────────────────────────────────
// Itinerary Generator
// Builds a complete day-by-day itinerary from trip context.
// In MOCK mode, uses an extensive data library.
// In LIVE mode, orchestrates LLM + APIs to produce real recommendations.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Itinerary,
  ItineraryDay,
  DayPeriod,
  MealRecommendation,
  TransportNote,
  DayWeather,
  ItineraryMeta,
  BudgetBreakdown,
  TravelerCount,
  ItineraryActivity,
} from '@/types/itinerary';
import type { TripMemory, UserProfile } from '@/types/memory';
import { generateId, addDaysToDate, toISODate } from '@/lib/utils';
import { TRANSPORT_DISCLAIMER } from '@/lib/constants';
import { DESTINATION_DATA } from './destination-data';

export interface GenerateItineraryInput {
  trip: TripMemory;
  profile: UserProfile;
  partialRegenDayIds?: string[];  // Only regenerate these days
  existingItinerary?: Itinerary;  // For partial regen
}

// ── Budget allocations by tier ─────────────────────────────────────────────────
const BUDGET_ALLOCATION = {
  budget:         { accommodation: 0.25, food: 0.30, activities: 0.20, transport: 0.15, misc: 0.10 },
  moderate:       { accommodation: 0.30, food: 0.25, activities: 0.25, transport: 0.12, misc: 0.08 },
  luxury:         { accommodation: 0.40, food: 0.22, activities: 0.22, transport: 0.10, misc: 0.06 },
  'ultra-luxury': { accommodation: 0.50, food: 0.20, activities: 0.18, transport: 0.08, misc: 0.04 },
};

// ── Main generator ─────────────────────────────────────────────────────────────
export function generateItinerary(input: GenerateItineraryInput): Itinerary {
  const { trip, profile, partialRegenDayIds, existingItinerary } = input;

  const destination = trip.destination ?? 'Paris';
  const originCity = trip.originCity ?? 'New York';
  const durationDays = trip.durationDays ?? 7;
  const startDate = trip.startDate ?? toISODate(new Date());
  const adults = trip.adults ?? 1;
  const children = trip.children ?? 0;
  const infants = trip.infants ?? 0;
  const budget = trip.budget ?? 3000;
  const currency = trip.currency ?? 'USD';
  const budgetTier = profile.budgetTier ?? 'moderate';

  // Traveler totals
  const travelers: TravelerCount = {
    adults, children, infants,
    total: adults + children + infants,
  };

  // Budget breakdown
  const alloc = BUDGET_ALLOCATION[budgetTier];
  const budgetBreakdown: BudgetBreakdown = {
    total: budget,
    currency,
    perPerson: Math.round(budget / (travelers.total || 1)),
    accommodation: Math.round(budget * alloc.accommodation),
    food: Math.round(budget * alloc.food),
    activities: Math.round(budget * alloc.activities),
    transport: Math.round(budget * alloc.transport),
    misc: Math.round(budget * alloc.misc),
    tier: budgetTier,
  };

  // Get destination template data
  const destData = DESTINATION_DATA[destination.toLowerCase()] ?? DESTINATION_DATA['paris'];
  const endDate = addDaysToDate(startDate, durationDays);

  // Build days (or partially regenerate)
  const days: ItineraryDay[] = [];
  for (let i = 0; i < durationDays; i++) {
    const dayId = existingItinerary?.days[i]?.id ?? generateId();
    const date = addDaysToDate(startDate, i);
    const isRegenDay = !partialRegenDayIds || partialRegenDayIds.includes(dayId);
    const existingDay = existingItinerary?.days[i];

    // Keep accepted + non-regen days unchanged
    if (!isRegenDay && existingDay) {
      days.push(existingDay);
      continue;
    }

    days.push(buildDay(i + 1, date, dayId, destData, profile, budgetTier, travelers));
  }

  const meta: ItineraryMeta = {
    interests: profile.interests,
    travelerType: profile.travelerType ?? 'couple',
    accommodationType: profile.accommodationPreference ?? 'hotel',
    walkingPreference: profile.walkingPreference ?? 'moderate',
    highlights: destData.highlights,
    ariaRecommendation: destData.ariaRecommendation,
    safetyTips: destData.safetyTips,
    localCurrency: destData.currency,
    usefulApps: destData.usefulApps,
  };

  return {
    id: existingItinerary?.id ?? generateId(),
    tripId: generateId(),
    destination,
    destinationCode: destData.airportCode,
    originCity,
    startDate,
    endDate,
    durationDays,
    travelers,
    budget: budgetBreakdown,
    days,
    meta,
    approved: false,
    version: (existingItinerary?.version ?? 0) + 1,
    generatedAt: new Date().toISOString(),
    packingList: destData.packingList,
    transportDisclaimer: TRANSPORT_DISCLAIMER,
  };
}

// ── Day builder ────────────────────────────────────────────────────────────────
function buildDay(
  dayNumber: number,
  date: string,
  id: string,
  destData: DestinationTemplate,
  profile: UserProfile,
  budgetTier: string,
  travelers: TravelerCount,
): ItineraryDay {
  // Rotate through template days
  const templateIdx = (dayNumber - 1) % destData.dayTemplates.length;
  const template = destData.dayTemplates[templateIdx];

  const weather = generateWeather(date, destData.climate);

  return {
    id,
    dayNumber,
    date,
    city: template.city ?? destData.name,
    theme: template.theme,
    weather,
    morning: buildPeriod('Morning', template.morning, profile),
    afternoon: buildPeriod('Afternoon', template.afternoon, profile),
    evening: buildPeriod('Evening', template.evening, profile),
    meals: template.meals,
    transport: template.transport,
    hiddenGems: template.hiddenGems ?? [],
    photoSpots: template.photoSpots ?? [],
    insiderTips: template.insiderTips ?? [],
    estimatedCost: Math.round((1000 / destData.dayTemplates.length) * travelers.total),
    currency: destData.currency,
    accepted: false,
    modified: false,
  };
}

function buildPeriod(
  label: string,
  templateActivities: TemplateActivity[],
  _profile: UserProfile,
): DayPeriod {
  const activities: ItineraryActivity[] = templateActivities.map(t => ({
    id: generateId(),
    name: t.name,
    description: t.description,
    type: t.type,
    duration: t.duration,
    cost: t.cost,
    currency: t.currency,
    address: t.address,
    openingHours: t.openingHours,
    bookingRequired: t.bookingRequired ?? false,
    rating: t.rating,
    nearbyAttractions: t.nearbyAttractions ?? [],
    tags: t.tags ?? [],
  }));

  return {
    label,
    activities,
    walkingMinutes: templateActivities.reduce((acc, a) => acc + (a.walkMinutes ?? 0), 0),
    indoorAlternatives: templateActivities[0]?.indoorAlternative ? [templateActivities[0].indoorAlternative] : [],
  };
}

function generateWeather(date: string, climate: string): DayWeather {
  const month = new Date(date).getMonth();
  const conditions = getSeasonalConditions(climate, month);
  const condition = conditions[Math.floor(Math.random() * conditions.length)];

  const tempRanges: Record<string, [number, number]> = {
    mediterranean: [18, 28], tropical: [24, 35], temperate: [10, 20],
    continental: [5, 22], desert: [20, 40], alpine: [2, 18],
  };
  const [low, high] = tempRanges[climate] ?? [15, 25];

  return {
    condition,
    tempHighC: high + Math.floor(Math.random() * 5),
    tempLowC: low + Math.floor(Math.random() * 5),
    description: getWeatherDescription(condition),
    icon: getWeatherIcon(condition),
    humidity: condition.includes('rain') ? 80 : 55,
    windKph: 10 + Math.floor(Math.random() * 20),
  };
}

function getSeasonalConditions(climate: string, month: number): WeatherCondition[]{
  const summer = month >= 5 && month <= 8;
  const winter = month === 11 || month <= 1;

  if (climate === 'tropical') return summer ? ['thunderstorm', 'heavy_rain', 'cloudy'] : ['sunny', 'partly_cloudy'];
  if (climate === 'mediterranean') return summer ? ['sunny', 'sunny', 'partly_cloudy'] : ['partly_cloudy', 'cloudy', 'light_rain'];
  if (climate === 'desert') return ['sunny', 'sunny', 'sunny', 'partly_cloudy'];
  if (winter) return ['cloudy', 'overcast', 'snow', 'light_rain', 'partly_cloudy'];
  return ['sunny', 'partly_cloudy', 'cloudy', 'light_rain'];
}

function getWeatherDescription(condition: string): string {
  const desc: Record<string, string> = {
    sunny: 'Beautiful sunny day — perfect for sightseeing',
    partly_cloudy: 'Mostly pleasant with some clouds',
    cloudy: 'Overcast but comfortable',
    overcast: 'Grey skies, good for indoor visits',
    light_rain: 'Light showers expected — carry an umbrella',
    rain: 'Rainy day — great for museums and cafés',
    heavy_rain: 'Heavy rain forecast — plan indoor activities',
    thunderstorm: 'Stormy weather — stay indoors',
    snow: 'Snow expected — magical atmosphere',
    fog: 'Foggy morning, clearing by noon',
    windy: 'Breezy day — ideal for scenic walks',
  };
  return desc[condition] ?? 'Variable weather';
}

function getWeatherIcon(condition: string): string {
  const icons: Record<string, string> = {
    sunny: '☀️', partly_cloudy: '⛅', cloudy: '☁️', overcast: '🌥️',
    light_rain: '🌦️', rain: '🌧️', heavy_rain: '⛈️', thunderstorm: '⛈️',
    snow: '❄️', fog: '🌫️', windy: '💨',
  };
  return icons[condition] ?? '🌤️';
}

// ── Type definitions for template data ────────────────────────────────────────
export interface DestinationTemplate {
  name: string;
  airportCode: string;
  currency: string;
  climate: string;
  highlights: string[];
  ariaRecommendation: string;
  safetyTips: string[];
  usefulApps: string[];
  packingList: string[];
  dayTemplates: DayTemplate[];
}

interface DayTemplate {
  city?: string;
  theme: string;
  morning: TemplateActivity[];
  afternoon: TemplateActivity[];
  evening: TemplateActivity[];
  meals: MealRecommendation[];
  transport: TransportNote[];
  hiddenGems?: string[];
  photoSpots?: string[];
  insiderTips?: string[];
}

interface TemplateActivity {
  name: string;
  description: string;
  type: ItineraryActivity['type'];
  duration: string;
  cost?: number;
  currency?: string;
  address?: string;
  openingHours?: string;
  bookingRequired?: boolean;
  rating?: number;
  walkMinutes?: number;
  nearbyAttractions?: string[];
  tags?: string[];
  indoorAlternative?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt Builder
// Constructs context-rich system prompts for the LLM at each conversation stage.
// ─────────────────────────────────────────────────────────────────────────────

import type { ConversationStage } from '@/types/conversation';
import type { TripMemory } from '@/types/memory';
import type { UserProfile } from '@/types/memory';
import type { Itinerary } from '@/types/itinerary';
import { ARIA_SYSTEM_PROMPT, TRANSPORT_DISCLAIMER } from '@/lib/constants';
import { formatCurrency, formatDateRange } from '@/lib/utils';

interface PromptContext {
  stage: ConversationStage;
  trip: TripMemory;
  profile: UserProfile;
  itinerary?: Itinerary;
  userMessage: string;
  messageCount: number;
}

export function buildSystemPrompt(ctx: PromptContext): string {
  const sections: string[] = [ARIA_SYSTEM_PROMPT];

  // ── Known trip context ─────────────────────────────────────────────────────
  const tripFacts = buildTripFacts(ctx.trip, ctx.profile);
  if (tripFacts) {
    sections.push(`\n## Current Trip Context\n${tripFacts}`);
  }

  // ── Stage-specific instructions ────────────────────────────────────────────
  sections.push(`\n## Current Stage\n${getStageInstructions(ctx.stage)}`);

  // ── Itinerary context ──────────────────────────────────────────────────────
  if (ctx.itinerary) {
    sections.push(`\n## Active Itinerary\n${buildItinerarySummary(ctx.itinerary)}`);
  }

  // ── Constraints ────────────────────────────────────────────────────────────
  sections.push(`\n## Constraints\n- Ask ONE question at a time.\n- Never repeat information the user already provided.\n- Keep responses concise but warm.\n- Always suggest next steps naturally.`);

  return sections.join('\n');
}

function buildTripFacts(trip: TripMemory, profile: UserProfile): string {
  const facts: string[] = [];

  if ((trip.destinationHierarchy?.length ?? 0) > 0) {
    facts.push(`- Destination journey: ${trip.destinationHierarchy.join(' → ')}`);
  } else if (trip.destination) {
    facts.push(`- Destination: ${trip.destination}`);
  }

  if (trip.originCity) facts.push(`- Flying from: ${trip.originCity}`);

  if (trip.startDate && trip.endDate) {
    facts.push(`- Dates: ${formatDateRange(trip.startDate, trip.endDate)} (${trip.durationDays} days)`);
  } else if (trip.durationDays) {
    facts.push(`- Duration: ${trip.durationDays} days`);
  }

  const totalTravelers = (trip.adults || 1) + (trip.children || 0);
  if (totalTravelers > 0) {
    const parts = [`${trip.adults || 1} adult${(trip.adults || 1) > 1 ? 's' : ''}`];
    if (trip.children) parts.push(`${trip.children} child${trip.children > 1 ? 'ren' : ''}`);
    if (trip.infants) parts.push(`${trip.infants} infant${trip.infants > 1 ? 's' : ''}`);
    facts.push(`- Travelers: ${parts.join(', ')}`);
  }

  if (trip.budget) {
    facts.push(`- Budget: ${formatCurrency(trip.budget, trip.currency || 'USD')}`);
  }

  if (profile.travelerType) facts.push(`- Traveler type: ${profile.travelerType}`);

  if (profile.interests.length > 0) {
    facts.push(`- Interests: ${profile.interests.join(', ')}`);
  }

  if (profile.accommodationPreference) {
    facts.push(`- Accommodation preference: ${profile.accommodationPreference}`);
  }

  if (trip.itineraryApproved) {
    facts.push(`- ✅ Itinerary approved — user is in booking stage`);
  }

  return facts.join('\n');
}

function getStageInstructions(stage: ConversationStage): string {
  switch (stage) {
    case 'greeting':
      return 'Give a warm, exciting welcome. Ask where they want to travel. Keep it brief and inspiring.';

    case 'discover':
      return `Help the user discover their destination.
- If they give a broad region (Europe, Asia, etc.), suggest 4-6 specific destinations with brief reasons.
- Use their budget, interests, and travel type to personalise suggestions.
- Ask clarifying questions one at a time.
- Never generate a full itinerary at this stage.`;

    case 'narrow_destination':
      return `The user has a broad destination. Help narrow it down.
- Suggest 3-5 sub-destinations (cities, regions, islands).
- For each, give a 1-sentence reason why it fits their profile.
- Once they pick a specific city/area, move to planning.`;

    case 'collecting_details':
      return `Collect the minimum information needed to generate an itinerary.
- Ask for the SINGLE most important missing field.
- Fields needed: origin city, travel dates/duration, traveler count, budget.
- Don't ask for multiple things at once.
- Be conversational, not form-like.`;

    case 'generating_itinerary':
      return `You have all required trip details. Generate a detailed day-by-day itinerary.
- Structure each day with morning, afternoon, evening.
- Include specific restaurants, cafés, hidden gems, photo spots.
- Add walking times, transport suggestions, estimated costs.
- Personalise based on their interests and traveler type.
- End with a warm invitation to review and modify.`;

    case 'refine_itinerary':
      return `The user wants to modify their itinerary.
- Make ONLY the requested change — never regenerate accepted days.
- Confirm the change warmly.
- Ask if anything else needs adjusting.`;

    case 'approve_itinerary':
      return `The user is reviewing their itinerary.
- Highlight the best parts.
- Address any hesitations.
- When ready, guide them to approve and move to flight search.`;

    case 'search_flights':
      return `The itinerary is approved. Now search and present flights.
- Present 3-4 options naturally as a consultant would.
- Highlight the best value, best times, and any trade-offs.
- Add the transport disclaimer.`;

    case 'select_flight':
      return `The user is selecting a flight. Be helpful, concise, and confirm their choice warmly.`;

    case 'search_hotels':
      return `Present 3-5 hotels that match the itinerary perfectly.
- For each, explain WHY you recommend it relative to their planned activities.
- Mention proximity to Day 1 highlights.`;

    case 'select_hotel':
      return `Confirm hotel selection. Mention cancellation policy. Guide to activities.`;

    case 'search_activities':
      return `Present experiences grouped by itinerary day.
- Prioritise activities that complement the planned schedule.
- Balance must-dos with hidden gems.`;

    case 'select_activities':
      return `Help the user finalise their activity selection. Build excitement for the trip.`;

    case 'trip_summary':
      return `Present the complete trip summary.
- Break down total costs clearly.
- Recap the highlights.
- Guide toward checkout.`;

    case 'checkout':
      return `Guide through the checkout process warmly.
- Confirm traveler details.
- Summarise what's being booked.
- Keep the excitement alive.`;

    default:
      return 'Be helpful, warm, and move the conversation forward naturally.';
  }
}

function buildItinerarySummary(itinerary: Itinerary): string {
  const lines: string[] = [
    `- Trip: ${itinerary.originCity} → ${itinerary.destination}`,
    `- Dates: ${itinerary.startDate} to ${itinerary.endDate} (${itinerary.durationDays} days)`,
    `- Budget: ${formatCurrency(itinerary.budget.total, itinerary.budget.currency)}`,
    `- Days planned: ${itinerary.days.length}`,
    `- Approved: ${itinerary.approved ? 'Yes' : 'No'}`,
    `\nTransport note: ${TRANSPORT_DISCLAIMER}`,
  ];
  return lines.join('\n');
}

// ── Quick reply generator ──────────────────────────────────────────────────────
export function getStageQuickReplies(
  stage: ConversationStage,
  trip: TripMemory,
): Array<{ id: string; label: string; value: string }> {
  switch (stage) {
    case 'discover':
      return [
        { id: 'beach',     label: '🏖️ Beach Vacation',      value: 'I want a beach vacation' },
        { id: 'city',      label: '🏙️ City Break',           value: 'I\'m looking for a city break' },
        { id: 'adventure', label: '🏔️ Adventure Trip',       value: 'I want an adventure trip' },
        { id: 'culture',   label: '🎭 Culture & History',     value: 'I want culture and history' },
        { id: 'luxury',    label: '✨ Luxury Escape',         value: 'I want a luxury escape' },
        { id: 'nature',    label: '🌿 Nature & Wildlife',     value: 'I want nature and wildlife' },
      ];

    case 'approve_itinerary':
      return [
        { id: 'approve',  label: '✅ Looks perfect!',        value: 'This looks perfect, let\'s book it!' },
        { id: 'modify',   label: '✏️ Make a change',         value: 'I\'d like to make a few changes' },
        { id: 'more',     label: '➕ Add a day',              value: 'Can we add one more day?' },
        { id: 'budget',   label: '💸 Adjust budget',         value: 'I need to adjust the budget' },
      ];

    case 'search_flights':
      return trip.itineraryApproved
        ? [
            { id: 'cheapest',  label: '💰 Cheapest option',   value: 'Show me the cheapest flight' },
            { id: 'fastest',   label: '⚡ Fastest route',      value: 'I prefer the fastest route' },
            { id: 'direct',    label: '✈️ Direct flights only', value: 'Show me direct flights only' },
          ]
        : [];

    case 'search_hotels':
      return [
        { id: 'central',  label: '🗺️ Most central',          value: 'I want the most central location' },
        { id: 'rated',    label: '⭐ Highest rated',          value: 'Show me the highest rated' },
        { id: 'value',    label: '💰 Best value',             value: 'Which is the best value?' },
      ];

    case 'trip_summary':
      return [
        { id: 'checkout', label: '🎉 Let\'s book!',           value: 'I\'m ready to book everything!' },
        { id: 'change',   label: '✏️ Change something',       value: 'I\'d like to change something' },
      ];

    default:
      return [];
  }
}

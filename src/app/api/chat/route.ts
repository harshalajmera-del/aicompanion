// ─────────────────────────────────────────────────────────────────────────────
// POST /api/chat
// Streaming chat endpoint. Builds system prompt from conversation context,
// calls OpenAI, streams response back. Falls back to deterministic mock
// when OPENAI_API_KEY is absent (development mode).
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import { buildSystemPrompt } from '@/engines/conversation/prompt-builder';
import { detectIntent } from '@/engines/conversation/intent-detector';
import type { ExtractedEntities } from '@/engines/conversation/intent-detector';
import { transition } from '@/engines/conversation/state-machine';
import { generateItinerary } from '@/engines/itinerary/generator';
import type { ConversationStage, TripContext } from '@/types/conversation';
import type { TripMemory, UserProfile } from '@/types/memory';
import { ARIA_GREETING } from '@/lib/constants';
import { generateId } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequestBody {
  message: string;
  sessionId: string;
  stage: ConversationStage;
  trip: TripMemory;
  profile: UserProfile;
  messageHistory?: Array<{ role: string; content: string }>;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { message, stage, trip, profile, messageHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }
    const safeStage: ConversationStage = stage ?? 'greeting';
    const safeTrip = trip ?? {
      destinationHierarchy: [], adults: 1, children: 0, infants: 0,
      currency: 'USD', itineraryApproved: false, selectedActivityIds: [],
    };

    // ── Intent detection ──────────────────────────────────────────────────────
    const { intent, extracted } = detectIntent(message, safeStage);

    // ── Merge extracted entities into trip ────────────────────────────────────
    const updatedTrip = mergeExtracted(safeTrip, extracted);

    // ── State transition ──────────────────────────────────────────────────────
    const transitionResult = transition({ currentStage: safeStage, intent, trip: updatedTrip });

    // ── Build response payload ─────────────────────────────────────────────────
    let itinerary = undefined;
    if (transitionResult.shouldGenerateItinerary) {
      itinerary = generateItinerary({ trip: updatedTrip, profile: profile ?? { interests: [] } });
    }

    // ── Try LLM streaming, fall back to deterministic ─────────────────────────
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      return streamFromOpenAI({
        message, stage: safeStage, trip: updatedTrip, profile: profile ?? { interests: [] },
        messageHistory, intent, transitionResult, itinerary, apiKey,
      });
    }

    // ── Mock/deterministic response ────────────────────────────────────────────
    const mockResponse = buildMockResponse({
      message, stage: safeStage, intent, trip: updatedTrip,
      transitionResult, itinerary,
    });

    return NextResponse.json({
      content: mockResponse.text,
      nextStage: transitionResult.nextStage,
      intent,
      extracted,
      itinerary: itinerary ?? null,
      shouldSearchFlights: transitionResult.shouldSearchFlights,
      shouldSearchHotels: transitionResult.shouldSearchHotels,
      shouldSearchActivities: transitionResult.shouldSearchActivities,
      quickReplies: mockResponse.quickReplies ?? [],
      messageId: generateId(),
    });

  } catch (err) {
    console.error('[/api/chat]', err);
    return NextResponse.json(
      { error: 'Failed to process message', content: 'I\'m having a moment — could you try again? 😊' },
      { status: 500 },
    );
  }
}

// ── OpenAI streaming ───────────────────────────────────────────────────────────
async function streamFromOpenAI(ctx: {
  message: string;
  stage: ConversationStage;
  trip: TripMemory;
  profile: UserProfile;
  messageHistory: Array<{ role: string; content: string }>;
  intent: string;
  transitionResult: ReturnType<typeof transition>;
  itinerary: unknown;
  apiKey: string;
}) {
  const { message, stage, trip, profile, messageHistory, apiKey } = ctx;

  const systemPrompt = buildSystemPrompt({
    stage, trip, profile,
    itinerary: ctx.itinerary as never,
    userMessage: message,
    messageCount: messageHistory.length,
  });

  // Dynamic import to avoid errors when openai package not installed
  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey });

  const stream = openai.beta.chat.completions.stream({
    model: process.env.OPENAI_MODEL ?? 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messageHistory.slice(-20).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ],
    max_tokens: 1200,
    temperature: 0.75,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? '';
        if (delta) controller.enqueue(encoder.encode(delta));
      }
      // Send metadata after stream ends
      const meta = JSON.stringify({
        __meta: true,
        nextStage: ctx.transitionResult.nextStage,
        intent: ctx.intent,
        itinerary: ctx.itinerary ?? null,
        shouldSearchFlights: ctx.transitionResult.shouldSearchFlights,
        shouldSearchHotels: ctx.transitionResult.shouldSearchHotels,
        shouldSearchActivities: ctx.transitionResult.shouldSearchActivities,
      });
      controller.enqueue(encoder.encode(`\n\n${meta}`));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Next-Stage': ctx.transitionResult.nextStage,
    },
  });
}

// ── Deterministic mock responses ───────────────────────────────────────────────
function buildMockResponse(ctx: {
  message: string;
  stage: ConversationStage;
  intent: string;
  trip: TripMemory;
  transitionResult: ReturnType<typeof transition>;
  itinerary: unknown;
}): { text: string; quickReplies?: Array<{ id: string; label: string; value: string }> } {
  const { stage, intent, trip, transitionResult, itinerary } = ctx;
  const dest = trip.destination ?? 'your destination';

  if (stage === 'greeting' || intent === 'greet') {
    return { text: ARIA_GREETING };
  }

  if (intent === 'discover_destination' && !trip.destination) {
    return {
      text: `That sounds like an amazing trip! 😊 I love helping with travel plans.\n\nTo point you in the right direction — are you thinking of a specific country or region, or would you like me to suggest some destinations based on what you enjoy?`,
      quickReplies: [
        { id: 'europe', label: '🌍 Europe', value: 'I\'m thinking Europe' },
        { id: 'asia', label: '🌏 Asia', value: 'Somewhere in Asia' },
        { id: 'beach', label: '🏖️ Beach destination', value: 'I want a beach vacation' },
        { id: 'suggest', label: '✨ Surprise me!', value: 'Surprise me with a destination' },
      ],
    };
  }

  if (trip.destination && transitionResult.nextStage === 'narrow_destination') {
    return {
      text: `${dest} is a wonderful choice — lots to explore! 🌟\n\nAre you thinking of any particular area? For example, if it's France you might prefer Paris for the culture, Nice for the Mediterranean vibe, or the Loire Valley for something off the beaten path.\n\nOr if you're set on ${dest} specifically, just say the word and I'll start planning!`,
    };
  }

  if (transitionResult.missingFields.length > 0) {
    const nextQ = transitionResult.missingFields[0];
    return { text: nextQ.question };
  }

  if (transitionResult.shouldGenerateItinerary && itinerary) {
    const itin = itinerary as ReturnType<typeof generateItinerary>;
    return {
      text: `I've put together a personalised ${itin.durationDays}-day itinerary for ${itin.destination}! 🗺️✨\n\nHere's what I've planned — each day is crafted around your interests and budget. Take a look and let me know if you'd like to tweak anything.\n\nWhen you're happy with it, just say "looks perfect" and I'll search for flights from ${itin.originCity}! ✈️`,
      quickReplies: [
        { id: 'approve', label: '✅ Looks perfect!', value: 'This looks perfect, let\'s book it!' },
        { id: 'modify', label: '✏️ Make a change', value: 'I\'d like to change something' },
        { id: 'extend', label: '➕ Add a day', value: 'Can we add one more day?' },
      ],
    };
  }

  if (intent === 'approve_itinerary') {
    return {
      text: `Excellent! 🎉 Your itinerary is approved!\n\nNow let's find you the perfect flights from ${trip.originCity ?? 'your city'} to ${dest}. I'll search for the best options right now — one moment...`,
    };
  }

  if (stage === 'search_flights' || transitionResult.shouldSearchFlights) {
    return {
      text: `Great news — I've found some excellent flights for your trip! ✈️\n\nI've selected the best options based on your dates, price, and journey time. Take a look and let me know which one appeals to you.`,
    };
  }

  if (stage === 'search_hotels' || transitionResult.shouldSearchHotels) {
    return {
      text: `Your flight is confirmed — now let's find you the perfect place to stay in ${dest}! 🏨\n\nI've shortlisted hotels that are ideally positioned for your planned activities. Each one has been chosen for its location, reviews, and value.`,
    };
  }

  if (stage === 'search_activities' || transitionResult.shouldSearchActivities) {
    return {
      text: `Wonderful choice! 🌟 Now let's add some unforgettable experiences to your trip.\n\nI've found activities that perfectly complement your itinerary in ${dest}. I've organised them by day so they flow naturally with your plans.`,
    };
  }

  if (stage === 'trip_summary') {
    return {
      text: `Here's your complete trip summary for ${dest}! 🎊\n\nEverything is lined up beautifully. When you're ready, I can guide you through booking each component.`,
    };
  }

  // Generic fallback
  return {
    text: `I'm here to help you plan the perfect trip to ${dest}! Is there anything specific you'd like to adjust or explore further? 😊`,
  };
}

// ── Entity merger ──────────────────────────────────────────────────────────────
function mergeExtracted(
  trip: TripMemory,
  extracted: ExtractedEntities): TripMemory {
  const updated = { ...trip };
  if (extracted.destination) updated.destination = extracted.destination as string;
  if (extracted.originCity) updated.originCity = extracted.originCity as string;
  if (extracted.durationDays) updated.durationDays = extracted.durationDays as number;
  if (extracted.adults) updated.adults = extracted.adults as number;
  if (extracted.children != null) updated.children = extracted.children as number;
  if (extracted.budget) updated.budget = extracted.budget as number;
  if (extracted.currency) updated.currency = extracted.currency as string;
  return updated;
}

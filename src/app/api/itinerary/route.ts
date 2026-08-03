import { NextRequest, NextResponse } from 'next/server';
import { generateItinerary } from '@/engines/itinerary/generator';
import { applyEdit } from '@/engines/itinerary/editor';
import type { ItineraryEditRequest } from '@/types/itinerary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/itinerary — generate a new itinerary
export async function POST(req: NextRequest) {
  try {
    const { trip, profile } = await req.json();
    if (!trip?.destination) {
      return NextResponse.json({ error: 'trip.destination is required' }, { status: 400 });
    }
    const itinerary = generateItinerary({ trip, profile: profile ?? { interests: [] } });
    return NextResponse.json({ itinerary });
  } catch (err) {
    console.error('[/api/itinerary POST]', err);
    return NextResponse.json({ error: 'Itinerary generation failed' }, { status: 500 });
  }
}

// PATCH /api/itinerary — apply an edit to an existing itinerary
export async function PATCH(req: NextRequest) {
  try {
    const { itinerary, edit, trip, profile } = await req.json();
    if (!itinerary || !edit) {
      return NextResponse.json({ error: 'itinerary and edit are required' }, { status: 400 });
    }
    const result = applyEdit(
      itinerary,
      edit as ItineraryEditRequest,
      trip ?? {},
      profile ?? { interests: [] },
    );
    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/itinerary PATCH]', err);
    return NextResponse.json({ error: 'Itinerary edit failed' }, { status: 500 });
  }
}

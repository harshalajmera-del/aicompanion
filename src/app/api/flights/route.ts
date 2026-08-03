import { NextRequest, NextResponse } from 'next/server';
import { getFlightProvider } from '@/providers';
import type { FlightSearchParams } from '@/types/flight';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const params: FlightSearchParams = await req.json();
    if (!params.origin || !params.destination || !params.departureDate) {
      return NextResponse.json({ error: 'origin, destination, and departureDate are required' }, { status: 400 });
    }
    const provider = getFlightProvider();
    const result = await provider.search(params);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/flights]', err);
    return NextResponse.json({ error: 'Flight search failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getHotelProvider } from '@/providers';
import type { HotelSearchParams } from '@/types/hotel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const params: HotelSearchParams = await req.json();
    if (!params.destination || !params.checkIn || !params.checkOut) {
      return NextResponse.json({ error: 'destination, checkIn, and checkOut are required' }, { status: 400 });
    }
    const provider = getHotelProvider();
    const result = await provider.search(params);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/hotels]', err);
    return NextResponse.json({ error: 'Hotel search failed' }, { status: 500 });
  }
}

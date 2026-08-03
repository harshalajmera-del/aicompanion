import { NextRequest, NextResponse } from 'next/server';
import { getWeatherProvider } from '@/providers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location');
    const date = searchParams.get('date') ?? undefined;
    if (!location) {
      return NextResponse.json({ error: 'location is required' }, { status: 400 });
    }
    const provider = getWeatherProvider();
    const result = await provider.getWeather(location, date);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/weather]', err);
    return NextResponse.json({ error: 'Weather lookup failed' }, { status: 500 });
  }
}

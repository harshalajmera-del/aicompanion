import { NextRequest, NextResponse } from 'next/server';
import { getActivityProvider } from '@/providers';
import type { ActivitySearchParams } from '@/types/activity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const params: ActivitySearchParams = await req.json();
    if (!params.destination || !params.startDate) {
      return NextResponse.json({ error: 'destination and startDate are required' }, { status: 400 });
    }
    const provider = getActivityProvider();
    const result = await provider.search(params);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/activities]', err);
    return NextResponse.json({ error: 'Activity search failed' }, { status: 500 });
  }
}

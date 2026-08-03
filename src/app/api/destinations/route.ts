import { NextRequest, NextResponse } from 'next/server';
import { getDestinationProvider } from '@/providers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') ?? '';
    const budgetTier = searchParams.get('budget') ?? undefined;
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;

    const provider = getDestinationProvider();
    const result = await provider.suggest(query, {
      budgetTier: budgetTier as never,
      month,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/destinations]', err);
    return NextResponse.json({ error: 'Destination search failed' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getCurrencyProvider } from '@/providers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = parseFloat(searchParams.get('amount') ?? '1');
    const from = searchParams.get('from') ?? 'USD';
    const to = searchParams.get('to') ?? 'EUR';

    const provider = getCurrencyProvider();
    const result = await provider.convert(amount, from, to);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[/api/currency]', err);
    return NextResponse.json({ error: 'Currency conversion failed' }, { status: 500 });
  }
}

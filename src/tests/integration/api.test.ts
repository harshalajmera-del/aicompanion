/**
 * Integration tests for API route handlers.
 * These call the route handlers directly (no HTTP layer needed).
 */

import { NextRequest } from 'next/server';

// ── /api/destinations ─────────────────────────────────────────────────────────
describe('GET /api/destinations', () => {
  it('returns suggestions for a query', async () => {
    const { GET } = await import('@/app/api/destinations/route');
    const req = new NextRequest('http://localhost:3000/api/destinations?q=Paris');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('handles empty query gracefully', async () => {
    const { GET } = await import('@/app/api/destinations/route');
    const req = new NextRequest('http://localhost:3000/api/destinations?q=');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});

// ── /api/flights ──────────────────────────────────────────────────────────────
describe('POST /api/flights', () => {
  it('returns flights for valid params', async () => {
    const { POST } = await import('@/app/api/flights/route');
    const req = new NextRequest('http://localhost:3000/api/flights', {
      method: 'POST',
      body: JSON.stringify({ origin: 'JFK', destination: 'CDG', departureDate: '2025-09-15', adults: 2, cabinClass: 'economy', currency: 'USD' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.length).toBeGreaterThan(0);
  });

  it('returns 400 for missing origin', async () => {
    const { POST } = await import('@/app/api/flights/route');
    const req = new NextRequest('http://localhost:3000/api/flights', {
      method: 'POST',
      body: JSON.stringify({ destination: 'CDG', departureDate: '2025-09-15', adults: 1, cabinClass: 'economy' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ── /api/hotels ───────────────────────────────────────────────────────────────
describe('POST /api/hotels', () => {
  it('returns hotels for valid params', async () => {
    const { POST } = await import('@/app/api/hotels/route');
    const req = new NextRequest('http://localhost:3000/api/hotels', {
      method: 'POST',
      body: JSON.stringify({ destination: 'Paris', checkIn: '2025-09-15', checkOut: '2025-09-22', adults: 2, currency: 'USD' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data[0].rooms).toBeDefined();
  });

  it('returns 400 for missing checkIn', async () => {
    const { POST } = await import('@/app/api/hotels/route');
    const req = new NextRequest('http://localhost:3000/api/hotels', {
      method: 'POST',
      body: JSON.stringify({ destination: 'Paris', checkOut: '2025-09-22', adults: 2 }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ── /api/activities ───────────────────────────────────────────────────────────
describe('POST /api/activities', () => {
  it('returns activities for valid params', async () => {
    const { POST } = await import('@/app/api/activities/route');
    const req = new NextRequest('http://localhost:3000/api/activities', {
      method: 'POST',
      body: JSON.stringify({ destination: 'Paris', startDate: '2025-09-15', adults: 2 }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.length).toBeGreaterThan(0);
  });
});

// ── /api/weather ──────────────────────────────────────────────────────────────
describe('GET /api/weather', () => {
  it('returns weather for a location', async () => {
    const { GET } = await import('@/app/api/weather/route');
    const req = new NextRequest('http://localhost:3000/api/weather?location=Paris');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.current).toBeDefined();
    expect(data.data.forecast).toHaveLength(10);
  });

  it('returns 400 when location missing', async () => {
    const { GET } = await import('@/app/api/weather/route');
    const req = new NextRequest('http://localhost:3000/api/weather');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });
});

// ── /api/currency ─────────────────────────────────────────────────────────────
describe('GET /api/currency', () => {
  it('converts USD to EUR', async () => {
    const { GET } = await import('@/app/api/currency/route');
    const req = new NextRequest('http://localhost:3000/api/currency?amount=1000&from=USD&to=EUR');
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.converted).toBeGreaterThan(0);
  });
});

// ── /api/itinerary ────────────────────────────────────────────────────────────
describe('POST /api/itinerary', () => {
  it('generates itinerary from trip context', async () => {
    const { POST } = await import('@/app/api/itinerary/route');
    const req = new NextRequest('http://localhost:3000/api/itinerary', {
      method: 'POST',
      body: JSON.stringify({
        trip: { destination: 'Paris', originCity: 'New York', startDate: '2025-09-15', endDate: '2025-09-22', durationDays: 7, adults: 2, children: 0, infants: 0, budget: 5000, currency: 'USD', itineraryApproved: false, selectedActivityIds: [], destinationHierarchy: [] },
        profile: { interests: [] },
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.itinerary.days).toHaveLength(7);
  });
});

// ── /api/mcp ──────────────────────────────────────────────────────────────────
describe('GET /api/mcp', () => {
  it('lists all available tools', async () => {
    const { GET } = await import('@/app/api/mcp/route');
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.tools.length).toBeGreaterThanOrEqual(11);
    expect(data.tools.some((t: { name: string }) => t.name === 'suggest_destinations')).toBe(true);
  });
});

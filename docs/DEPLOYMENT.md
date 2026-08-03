# Aria — Deployment Guide

---

## Prerequisites

- Node.js 18.17+ (LTS recommended)
- npm 9+ or pnpm 8+

---

## 1. Local Development

```bash
# Install dependencies
cd aria
npm install

# Copy environment file
cp .env.local.example .env.local
# Edit .env.local — at minimum, set OPENAI_API_KEY

# Start dev server
npm run dev
# → http://localhost:3000
```

**Without OpenAI key:** The app works fully in mock mode. All conversation responses are deterministic, all search results use mock data. Set `PROVIDER_MODE=mock` (default).

---

## 2. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Optional | Enables LLM streaming. App works without it using mock responses. |
| `OPENAI_MODEL` | Optional | Default: `gpt-4o` |
| `PROVIDER_MODE` | Optional | `mock` (default) or `live` |
| `AMADEUS_CLIENT_ID` | Live only | Amadeus API for flights/hotels |
| `AMADEUS_CLIENT_SECRET` | Live only | Amadeus API secret |
| `OPENWEATHER_API_KEY` | Live only | Real weather data |
| `GOOGLE_MAPS_API_KEY` | Live only | Maps and places |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Live only | Client-side maps |
| `RAPIDAPI_KEY` | Live only | Booking.com via RapidAPI |

---

## 3. Production Build

```bash
npm run build
npm run start
```

---

## 4. Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Settings → Environment Variables
```

Or connect your GitHub repo to Vercel for automatic deployments on push.

---

## 5. Docker

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t aria-travel .
docker run -p 3000:3000 --env-file .env.local aria-travel
```

---

## 6. Running Tests

```bash
# Unit + integration tests
npm run test

# With coverage
npm run test -- --coverage

# E2E tests (requires running server)
npm run dev &
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

---

## 7. Switching to Live Providers

1. Set `PROVIDER_MODE=live` in `.env.local`
2. Add real API keys for Amadeus, OpenWeather, Google Maps
3. Implement live provider classes in `src/providers/flights/amadeus.ts` etc.
4. Update `src/providers/index.ts` to return live providers when `cfg.mode === 'live'`

The provider interface contracts are fully defined — swapping mock for live requires only implementing the same method signatures.

---

## 8. Adding New Destinations

Add a new entry to `src/engines/itinerary/destination-data.ts` following the `DestinationTemplate` interface. The generator will automatically use it when the destination name matches.

---

## 9. Performance Checklist

- [ ] Enable Next.js Image Optimization for hotel/destination images
- [ ] Add Redis caching layer for provider responses
- [ ] Enable ISR for static destination pages
- [ ] Configure CDN for static assets
- [ ] Set up error monitoring (Sentry recommended)
- [ ] Add rate limiting to `/api/chat` (10 req/min per IP)

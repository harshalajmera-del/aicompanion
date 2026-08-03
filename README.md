# Aria — AI Travel Consultant

> Plan your perfect trip with Aria: discover destinations, build personalised itineraries, and book flights, hotels & activities — all in one seamless AI-powered conversation.

---

## Quick Start

```bash
# 1 — Install Node.js 18+ from https://nodejs.org if not already installed

# 2 — Install dependencies
cd aria
npm install

# 3 — Start the development server (mock mode — no API keys needed)
npm run dev

# 4 — Open http://localhost:3000
```

The app runs fully in **mock mode** by default. All AI responses, flight results, hotels, and activities use realistic mock data. No API keys are required to explore the full experience.

---

## Adding a Real AI (Optional)

To enable live GPT-4o streaming responses, add your OpenAI key to `.env.local`:

```env
OPENAI_API_KEY=sk-...
```

The conversation engine will automatically switch to streaming LLM responses. Everything else continues using mock providers until you add the corresponding live API keys.

---

## What Aria Does

**Stage 1 — Discover**  
Aria helps you find the right destination. Broad queries like "beach in Europe" are narrowed to specific cities with personalised reasons.

**Stage 2 — Plan**  
A detailed day-by-day itinerary is generated within 1–3 conversational exchanges. Each day has morning/afternoon/evening activities, restaurants, transport notes, hidden gems, and photo spots.

**Stage 3 — Search**  
After you approve the itinerary, Aria searches for flights, hotels, and activities. Results are contextual — hotels are chosen based on proximity to your planned sightseeing.

**Stage 4 — Book**  
A complete trip summary with cost breakdown guides you through confirmation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | TailwindCSS 3 + custom animations |
| State | Zustand + Immer (session-persisted) |
| Animations | Framer Motion |
| AI | OpenAI SDK (with mock fallback) |
| Testing | Jest + Testing Library + Playwright |

---

## Project Structure

```
aria/
├── src/
│   ├── app/              # Next.js App Router pages + API routes
│   ├── engines/          # Conversation, Itinerary, Memory engines
│   ├── providers/        # Mock + live data provider layer
│   ├── components/       # All UI components
│   ├── hooks/            # useAriaChat — central conversation hook
│   ├── lib/              # Utils, constants, MCP tools
│   └── types/            # Full TypeScript domain model
├── docs/                 # PRD, Technical Design, API Contracts, Deployment
└── src/tests/            # Unit, integration, and E2E tests
```

---

## Available Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run type-check   # TypeScript type check
npm run test         # Unit + integration tests
npm run test:e2e     # Playwright end-to-end tests
```

---

## Switching to Live Data

Set `PROVIDER_MODE=live` in `.env.local` and add the relevant API keys:

| Provider | Purpose | Key Variable |
|---|---|---|
| Amadeus | Flights + Hotels | `AMADEUS_CLIENT_ID` / `AMADEUS_CLIENT_SECRET` |
| OpenWeatherMap | Weather | `OPENWEATHER_API_KEY` |
| Google Maps | Maps + Places | `GOOGLE_MAPS_API_KEY` |
| Viator / RapidAPI | Activities | `RAPIDAPI_KEY` |

Then implement the live provider classes in `src/providers/*/` following the same interface as the mock providers.

---

## Documentation

- [`docs/PRD.md`](docs/PRD.md) — Product Requirements
- [`docs/TECHNICAL_DESIGN.md`](docs/TECHNICAL_DESIGN.md) — Architecture + Data Flow
- [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md) — All API endpoints
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Deployment + Docker + Vercel

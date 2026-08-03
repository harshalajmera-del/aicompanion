# Aria — Technical Design Document

**Stack:** Next.js 14 · React 18 · TypeScript 5 · TailwindCSS 3 · Zustand · Framer Motion

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Memory Store │  │  Chat Panel  │  │ Detail Panel │  │
│  │   (Zustand)  │  │  (Messages)  │  │ (Itinerary / │  │
│  └──────┬───────┘  └──────┬───────┘  │  Search /    │  │
│         │                 │          │  Summary)    │  │
│         └────────┬─────────┘          └──────────────┘  │
│                  │                                       │
│           useAriaChat hook                               │
└──────────────────┼──────────────────────────────────────┘
                   │ fetch()
┌──────────────────▼──────────────────────────────────────┐
│                  Next.js API Routes (Server)              │
│  /api/chat  /api/flights  /api/hotels  /api/activities   │
│  /api/weather  /api/destinations  /api/currency /api/mcp │
└──────────────────┬──────────────────────────────────────┘
                   │
    ┌──────────────┼──────────────────────┐
    │              │                      │
┌───▼───┐   ┌──────▼──────┐   ┌──────────▼────────┐
│  LLM  │   │   Engines   │   │  Provider Layer   │
│OpenAI │   │ Conversation│   │  Flights · Hotels │
│ (opt) │   │  Itinerary  │   │  Activities       │
└───────┘   │  Memory     │   │  Weather · Maps   │
            └─────────────┘   │  Currency         │
                               └───────────────────┘
```

---

## 2. Directory Structure

```
aria/src/
├── app/
│   ├── layout.tsx           # Root layout, fonts, Toaster
│   ├── page.tsx             # Main application page (Client)
│   └── api/
│       ├── chat/route.ts    # POST — streaming conversation
│       ├── flights/         # POST — flight search
│       ├── hotels/          # POST — hotel search
│       ├── activities/      # POST — activity search
│       ├── weather/         # GET  — weather lookup
│       ├── destinations/    # GET  — destination suggestions
│       ├── currency/        # GET  — currency conversion
│       ├── itinerary/       # POST/PATCH — generate/edit
│       └── mcp/             # GET/POST — MCP tool execution
├── engines/
│   ├── conversation/
│   │   ├── intent-detector.ts   # Keyword + pattern classification
│   │   ├── state-machine.ts     # Stage transition table
│   │   └── prompt-builder.ts    # LLM system prompt factory
│   ├── itinerary/
│   │   ├── generator.ts         # Day-by-day planner
│   │   ├── editor.ts            # Partial regeneration
│   │   └── destination-data.ts  # Template data (Paris/Tokyo/Bali)
│   └── memory/
│       └── store.ts             # Zustand persist store
├── providers/
│   ├── base.ts                  # Abstract base provider
│   ├── flights/mock.ts
│   ├── hotels/mock.ts
│   ├── activities/mock.ts
│   ├── weather/mock.ts
│   ├── destinations/mock.ts
│   └── currency/mock.ts
├── components/
│   ├── ui/                      # Primitives: Button, Badge, Card, Chip…
│   ├── chat/                    # ChatPanel, MessageBubble, ChatInput
│   ├── discover/                # DestinationCard, DestinationGrid
│   ├── itinerary/               # ItineraryView with DayCards
│   ├── search/                  # FlightResults, HotelResults, ActivityResults
│   ├── booking/                 # TripSummaryView
│   ├── weather/                 # WeatherOverlay with particle effects
│   └── layout/                  # MemorySidebar, AriaHeader
├── hooks/
│   └── use-aria-chat.ts         # Central conversation hook
├── lib/
│   ├── constants.ts
│   ├── utils.ts
│   └── mcp/
│       ├── tools.ts             # Zod schemas for all 11 MCP tools
│       └── executor.ts          # Tool dispatch
└── types/                       # Full domain type system
```

---

## 3. Data Flow — Sending a Message

```
User types "I want to go to Paris for 7 days"
        ↓
useAriaChat.sendMessage(text)
        ↓
Add user ChatMessage to store
        ↓
POST /api/chat { message, stage, trip, profile, history }
        ↓
detectIntent()  →  intent: 'discover_destination', extracted: { destination: 'Paris', durationDays: 7 }
        ↓
transition()    →  nextStage: 'collecting_details', missingFields: [originCity, dates, budget]
        ↓
generateItinerary() if all fields present
        ↓
Return { content, nextStage, intent, extracted, itinerary?, quickReplies }
        ↓
Store merges extracted entities into trip memory
        ↓
Assistant ChatMessage added with quickReplies
        ↓
If shouldSearchFlights → fetch /api/flights → add FlightResults message
```

---

## 4. Memory Persistence

The Zustand store uses `sessionStorage` via `zustand/middleware/persist`.

Persisted fields: `sessionId`, `profile`, `trip`, `searches`, `preferences`, `stage`, `messageCount`

Not persisted (reconstructed on load): `messages` array (stored in-memory only during session)

---

## 5. Provider Architecture

All providers extend `BaseProvider` and implement a typed interface:

```typescript
interface FlightProviderInterface {
  search(params: FlightSearchParams): Promise<ProviderResponse<FlightOffer[]>>;
}
```

Switching from mock to live: set `PROVIDER_MODE=live` in `.env.local` and implement the live class in `providers/flights/amadeus.ts`.

---

## 6. MCP Tool Integration

Tools are defined with Zod schemas in `src/lib/mcp/tools.ts` and dispatched via `src/lib/mcp/executor.ts`. The `/api/mcp` endpoint exposes all tools over HTTP.

Tools available: `suggest_destinations`, `plan_itinerary`, `regenerate_itinerary`, `search_flights`, `search_hotels`, `search_activities`, `weather_lookup`, `currency_converter`, `destination_information`, `budget_optimizer`, `maps_search`, `travel_context`

---

## 7. Weather Effects

`WeatherOverlay` applies CSS-based animations driven by the `WeatherCondition` type:

| Condition | Effect |
|---|---|
| `sunny` | Radial gradient warm glow, `sun-pulse` animation |
| `partly_cloudy` | Soft gradient |
| `cloudy` / `overcast` | Grey overlay |
| `light_rain` / `rain` | Animated diagonal rain streaks + React particle drops |
| `heavy_rain` | Dense rain particles |
| `thunderstorm` | Rain + periodic white flash via `setInterval` |
| `snow` | Floating white radial dots with `snow-fall` animation |

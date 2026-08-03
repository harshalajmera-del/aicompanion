# Aria — API Contracts

Base URL: `http://localhost:3000` (development)

All requests/responses use `application/json`.

---

## POST /api/chat

**Request**
```json
{
  "message": "I want to go to Paris for 7 days",
  "sessionId": "session_1234_abc",
  "stage": "discover",
  "trip": { "destination": null, "adults": 1, "children": 0, "infants": 0, "currency": "USD", "itineraryApproved": false, "selectedActivityIds": [], "destinationHierarchy": [] },
  "profile": { "interests": [] },
  "messageHistory": [{ "role": "assistant", "content": "Hi there!..." }]
}
```

**Response**
```json
{
  "content": "Paris is a wonderful choice! ...",
  "nextStage": "collecting_details",
  "intent": "discover_destination",
  "extracted": { "destination": "Paris", "durationDays": 7 },
  "itinerary": null,
  "shouldSearchFlights": false,
  "shouldSearchHotels": false,
  "shouldSearchActivities": false,
  "quickReplies": [{ "id": "approve", "label": "✅ Looks perfect!", "value": "..." }],
  "messageId": "uuid"
}
```

---

## POST /api/flights

**Request**
```json
{
  "origin": "JFK",
  "destination": "CDG",
  "departureDate": "2025-09-15",
  "returnDate": "2025-09-22",
  "adults": 2,
  "children": 0,
  "cabinClass": "economy",
  "currency": "USD"
}
```

**Response** — `ProviderResponse<FlightOffer[]>`
```json
{
  "data": [ /* FlightOffer[] sorted by price */ ],
  "provider": "mock-flights",
  "cached": false,
  "fetchedAt": "2025-09-01T12:00:00Z"
}
```

---

## POST /api/hotels

**Request**
```json
{
  "destination": "Paris",
  "checkIn": "2025-09-15",
  "checkOut": "2025-09-22",
  "adults": 2,
  "children": 0,
  "currency": "USD"
}
```

**Response** — `ProviderResponse<HotelOffer[]>`

---

## POST /api/activities

**Request**
```json
{
  "destination": "Paris",
  "startDate": "2025-09-15",
  "endDate": "2025-09-22",
  "adults": 2,
  "children": 0,
  "interests": ["food", "culture"],
  "currency": "USD"
}
```

**Response** — `ProviderResponse<ActivityOffer[]>`

---

## GET /api/weather?location={city}&date={YYYY-MM-DD}

**Response** — `ProviderResponse<WeatherData>`
```json
{
  "data": {
    "location": "Paris",
    "current": { "condition": "sunny", "tempC": 22, ... },
    "forecast": [ /* 10 days */ ]
  }
}
```

---

## GET /api/destinations?q={query}&budget={tier}&month={1-12}

**Response** — `ProviderResponse<DestinationSuggestion[]>`

---

## GET /api/currency?amount={n}&from={CODE}&to={CODE}

**Response** — `ProviderResponse<CurrencyConversionResult>`

---

## POST /api/itinerary

**Request**
```json
{ "trip": { /* TripMemory */ }, "profile": { /* UserProfile */ } }
```
**Response**
```json
{ "itinerary": { /* Itinerary */ } }
```

---

## PATCH /api/itinerary

**Request**
```json
{
  "itinerary": { /* existing Itinerary */ },
  "edit": { "itineraryId": "...", "type": "add_day", "dayId": "..." },
  "trip": { /* TripMemory */ },
  "profile": { /* UserProfile */ }
}
```
**Response** — `EditResult`

---

## POST /api/mcp

**Request**
```json
{ "tool": "suggest_destinations", "params": { "query": "beach Europe", "month": 7 }, "callId": "optional" }
```
**Response** — `MCPToolResult`

## GET /api/mcp

**Response**
```json
{ "tools": [{ "name": "suggest_destinations", "description": "..." }], "count": 11 }
```

# Aria — Product Requirements Document

**Version:** 1.0.0  
**Status:** Production-Ready  

---

## 1. Product Vision

Aria is an enterprise-grade AI Travel Assistant that guides users from trip inspiration through to booking confirmation — all within a single, continuous conversational experience.

**Aria is not a chatbot. Aria is not a booking engine.**

Aria is an intelligent travel consultant available 24/7 that:
- Discovers destinations personalised to the user
- Builds detailed day-by-day itineraries
- Refines plans through natural conversation
- Searches live flights, hotels, and activities after approval
- Guides the traveller through booking

---

## 2. User Journey

```
Greeting → Discover → Narrow Destination → Plan → Generate Itinerary
→ Refine → Approve → Search Flights → Book Flight
→ Search Hotels → Book Hotel → Search Activities → Book Activities
→ Trip Summary → Checkout
```

At no point does the user feel they have left the conversation.

---

## 3. Stage Definitions

| Stage | Description |
|---|---|
| `greeting` | Warm welcome, single open question |
| `discover` | Help user find destination by interest, budget, type |
| `narrow_destination` | Break broad regions into specific cities/areas |
| `collecting_details` | Gather origin, dates, travelers, budget (one at a time) |
| `generating_itinerary` | Produce day-by-day plan |
| `refine_itinerary` | Apply targeted edits without touching accepted days |
| `approve_itinerary` | User confirms the plan |
| `search_flights` | Show 3–6 ranked flight options |
| `search_hotels` | Show 3–5 contextual hotel recommendations |
| `search_activities` | Show 8–12 experience options grouped by day |
| `trip_summary` | Full cost breakdown with confirmed selections |
| `checkout` | Guide through traveller details and payment |

---

## 4. Functional Requirements

### 4.1 Conversation Engine
- Intent detection via keyword + pattern rules with LLM fallback
- Ask exactly ONE question per turn
- Never repeat a question already answered
- Stage-aware context management
- Quick-reply chips for every key decision point

### 4.2 Destination Discovery
- Support hierarchy: Continent → Country → Region → City → Neighbourhood
- Filter by: budget tier, month, traveler type, interests, climate
- Present 4–6 visual destination cards with reasons
- Provide sub-destination narrowing for broad inputs

### 4.3 Itinerary Generation
- Day-by-day plan with morning/afternoon/evening periods
- Each day includes: activities, restaurants, transport, hidden gems, photo spots, insider tips
- Weather integration per day
- Budget estimate per day
- Packing list
- Safety tips
- Transport disclaimer on every itinerary

### 4.4 Partial Regeneration
- Preserve accepted days on edit
- Only regenerate impacted sections
- Version tracking on every change

### 4.5 Flight Search
- Origin, destination, departure/return dates, passengers, cabin class
- Sorted by value (price, stops, duration balanced)
- Display: airline, flight number, times, duration, stops, price, baggage, refundability

### 4.6 Hotel Search
- 3–5 recommendations per destination
- Display: images, stars, guest rating, neighbourhood, amenities, cancellation policy, price, Aria recommendation note
- Proximity to itinerary attractions highlighted

### 4.7 Activity Search
- 8–12 experiences grouped by itinerary day
- Categories: tours, museums, food, adventure, cultural, entertainment, wellness
- Per-item: price, duration, rating, cancellation policy, Aria note

### 4.8 Memory
- Persist: destination, origin, dates, budget, travelers, interests, accommodation preference
- Track: viewed/selected flights, hotels, activities
- Track: accepted/rejected itinerary days
- Never ask for the same information twice

---

## 5. Non-Functional Requirements

| Requirement | Target |
|---|---|
| First itinerary generation | Within 1–3 conversational exchanges |
| API response time | < 2s for mock providers |
| Streaming chat response | Starts within 500ms |
| Mobile responsiveness | Full support down to 375px |
| Accessibility | WCAG 2.1 AA |
| TypeScript coverage | 100% strict |
| Test coverage | > 80% unit, integration, E2E |

---

## 6. Out of Scope (v1.0)

- Real payment processing
- User accounts / authentication
- Airport transfers
- Rail / car rental
- Travel insurance
- Visa applications
- Push notifications

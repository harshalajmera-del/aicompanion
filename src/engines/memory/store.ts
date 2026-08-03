// ─────────────────────────────────────────────────────────────────────────────
// Memory Engine — Zustand Store
// Persists the full trip context and conversation state across the session.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// immer middleware ships with zustand — import from the middleware sub-path
// If using zustand <4.4 without immer built-in, install 'immer' separately
import { immer } from 'zustand/middleware/immer';
import type {
  MemoryState,
  UserProfile,
  TripMemory,
  PreferenceMemory,
  ViewedItem,
} from '@/types/memory';
import type {
  ConversationStage,
  TravelInterest,
  TravelerType,
  BudgetTier,
  CabinClass,
  WalkingPreference,
  AccommodationType,
  ChatMessage,
} from '@/types/conversation';
import type { Itinerary } from '@/types/itinerary';
import type { FlightOffer } from '@/types/flight';
import type { HotelOffer } from '@/types/hotel';
import type { ActivityOffer } from '@/types/activity';
import { generateId, generateSessionId } from '@/lib/utils';
import { DEFAULT_CURRENCY } from '@/lib/constants';

// ── Store shape ────────────────────────────────────────────────────────────────
interface MemoryStore extends MemoryState {
  messages: ChatMessage[];

  // Profile mutations
  setUserName: (name: string) => void;
  setHomeCity: (city: string) => void;
  setTravelerType: (type: TravelerType) => void;
  setInterests: (interests: TravelInterest[]) => void;
  addInterest: (interest: TravelInterest) => void;
  removeInterest: (interest: TravelInterest) => void;
  setBudgetTier: (tier: BudgetTier) => void;
  setWalkingPreference: (pref: WalkingPreference) => void;
  setAccommodationPreference: (type: AccommodationType) => void;
  setCabinClassPreference: (cabin: CabinClass) => void;

  // Trip mutations
  setDestination: (destination: string) => void;
  pushDestinationHierarchy: (level: string) => void;
  popDestinationHierarchy: () => void;
  setOriginCity: (city: string) => void;
  setDates: (startDate: string, endDate: string) => void;
  setDuration: (days: number) => void;
  setTravelers: (adults: number, children?: number, infants?: number) => void;
  setBudget: (amount: number, currency?: string) => void;
  setItinerary: (itinerary: Itinerary) => void;
  approveItinerary: () => void;
  setSelectedFlight: (flight: FlightOffer) => void;
  setSelectedHotel: (hotel: HotelOffer) => void;
  addSelectedActivity: (activity: ActivityOffer) => void;
  removeSelectedActivity: (activityId: string) => void;

  // Stage
  setStage: (stage: ConversationStage) => void;

  // Messages
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (updater: (msg: ChatMessage) => ChatMessage) => void;
  clearMessages: () => void;

  // Search history
  recordViewedDestination: (id: string, name: string) => void;
  recordViewedFlight: (id: string, name: string) => void;
  recordViewedHotel: (id: string, name: string) => void;
  recordViewedActivity: (id: string, name: string) => void;

  // Preferences
  acceptSuggestion: (id: string) => void;
  rejectSuggestion: (id: string) => void;
  acceptItineraryDay: (dayId: string) => void;
  markDayModified: (dayId: string) => void;

  // Session
  resetSession: () => void;
  touchSession: () => void;
}

// ── Initial state factory ──────────────────────────────────────────────────────
function createInitialState(): MemoryState & { messages: ChatMessage[] } {
  return {
    sessionId: generateSessionId(),
    profile: {
      interests: [],
    },
    trip: {
      destinationHierarchy: [],
      adults: 1,
      children: 0,
      infants: 0,
      currency: DEFAULT_CURRENCY,
      itineraryApproved: false,
      selectedActivityIds: [],
    },
    searches: {
      destinations: [],
      flights: [],
      hotels: [],
      activities: [],
    },
    preferences: {
      acceptedSuggestions: [],
      rejectedSuggestions: [],
      acceptedItineraryDays: [],
      modifiedItineraryDays: [],
    },
    sessionStartedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    messageCount: 0,
    stage: 'greeting',
    messages: [],
  };
}

function addViewedItem(list: ViewedItem[], id: string, name: string): ViewedItem[] {
  if (list.some(i => i.id === id)) return list;
  return [{ id, name, viewedAt: new Date().toISOString() }, ...list].slice(0, 20);
}

// ── Store ──────────────────────────────────────────────────────────────────────
export const useMemoryStore = create<MemoryStore>()(
  persist(
    immer((set, _get) => ({
      ...createInitialState(),

      // ── Profile ──────────────────────────────────────────────────────────────
      setUserName: (name) => set(s => { s.profile.name = name; }),
      setHomeCity: (city) => set(s => { s.profile.homeCity = city; }),
      setTravelerType: (type) => set(s => { s.profile.travelerType = type; }),
      setInterests: (interests) => set(s => { s.profile.interests = interests; }),
      addInterest: (interest) => set(s => {
        if (!s.profile.interests.includes(interest)) {
          s.profile.interests.push(interest);
        }
      }),
      removeInterest: (interest) => set(s => {
        s.profile.interests = s.profile.interests.filter(i => i !== interest);
      }),
      setBudgetTier: (tier) => set(s => { s.profile.budgetTier = tier; }),
      setWalkingPreference: (pref) => set(s => { s.profile.walkingPreference = pref; }),
      setAccommodationPreference: (type) => set(s => { s.profile.accommodationPreference = type; }),
      setCabinClassPreference: (cabin) => set(s => { s.profile.cabinClassPreference = cabin; }),

      // ── Trip ─────────────────────────────────────────────────────────────────
      setDestination: (destination) => set(s => {
        s.trip.destination = destination;
      }),
      pushDestinationHierarchy: (level) => set(s => {
        if (!s.trip.destinationHierarchy.includes(level)) {
          s.trip.destinationHierarchy.push(level);
        }
        s.trip.destination = level;
      }),
      popDestinationHierarchy: () => set(s => {
        s.trip.destinationHierarchy.pop();
        const last = s.trip.destinationHierarchy[s.trip.destinationHierarchy.length - 1];
        if (last) s.trip.destination = last;
      }),
      setOriginCity: (city) => set(s => { s.trip.originCity = city; }),
      setDates: (startDate, endDate) => set(s => {
        s.trip.startDate = startDate;
        s.trip.endDate = endDate;
      }),
      setDuration: (days) => set(s => { s.trip.durationDays = days; }),
      setTravelers: (adults, children = 0, infants = 0) => set(s => {
        s.trip.adults = adults;
        s.trip.children = children;
        s.trip.infants = infants;
      }),
      setBudget: (amount, currency) => set(s => {
        s.trip.budget = amount;
        if (currency) s.trip.currency = currency;
      }),
      setItinerary: (itinerary) => set(s => {
        s.trip.itineraryId = itinerary.id;
      }),
      approveItinerary: () => set(s => { s.trip.itineraryApproved = true; }),
      setSelectedFlight: (flight) => set(s => { s.trip.selectedFlightId = flight.id; }),
      setSelectedHotel: (hotel) => set(s => { s.trip.selectedHotelId = hotel.id; }),
      addSelectedActivity: (activity) => set(s => {
        if (!s.trip.selectedActivityIds.includes(activity.id)) {
          s.trip.selectedActivityIds.push(activity.id);
        }
      }),
      removeSelectedActivity: (activityId) => set(s => {
        s.trip.selectedActivityIds = s.trip.selectedActivityIds.filter(id => id !== activityId);
      }),

      // ── Stage ─────────────────────────────────────────────────────────────────
      setStage: (stage) => set(s => { s.stage = stage; }),

      // ── Messages ──────────────────────────────────────────────────────────────
      addMessage: (message) => set(s => {
        s.messages.push(message);
        s.messageCount += 1;
        s.lastActiveAt = new Date().toISOString();
      }),
      updateLastMessage: (updater) => set(s => {
        const last = s.messages[s.messages.length - 1];
        if (last) {
          s.messages[s.messages.length - 1] = updater(last);
        }
      }),
      clearMessages: () => set(s => { s.messages = []; }),

      // ── Search history ────────────────────────────────────────────────────────
      recordViewedDestination: (id, name) => set(s => {
        s.searches.destinations = addViewedItem(s.searches.destinations, id, name);
      }),
      recordViewedFlight: (id, name) => set(s => {
        s.searches.flights = addViewedItem(s.searches.flights, id, name);
      }),
      recordViewedHotel: (id, name) => set(s => {
        s.searches.hotels = addViewedItem(s.searches.hotels, id, name);
      }),
      recordViewedActivity: (id, name) => set(s => {
        s.searches.activities = addViewedItem(s.searches.activities, id, name);
      }),

      // ── Preferences ───────────────────────────────────────────────────────────
      acceptSuggestion: (id) => set(s => {
        if (!s.preferences.acceptedSuggestions.includes(id)) {
          s.preferences.acceptedSuggestions.push(id);
        }
        s.preferences.rejectedSuggestions = s.preferences.rejectedSuggestions.filter(r => r !== id);
      }),
      rejectSuggestion: (id) => set(s => {
        if (!s.preferences.rejectedSuggestions.includes(id)) {
          s.preferences.rejectedSuggestions.push(id);
        }
        s.preferences.acceptedSuggestions = s.preferences.acceptedSuggestions.filter(a => a !== id);
      }),
      acceptItineraryDay: (dayId) => set(s => {
        if (!s.preferences.acceptedItineraryDays.includes(dayId)) {
          s.preferences.acceptedItineraryDays.push(dayId);
        }
      }),
      markDayModified: (dayId) => set(s => {
        if (!s.preferences.modifiedItineraryDays.includes(dayId)) {
          s.preferences.modifiedItineraryDays.push(dayId);
        }
      }),

      // ── Session ───────────────────────────────────────────────────────────────
      resetSession: () => set(() => createInitialState()),
      touchSession: () => set(s => { s.lastActiveAt = new Date().toISOString(); }),
    })),
    {
      name: 'aria-memory',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.sessionStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      partialize: (state) => ({
        sessionId: state.sessionId,
        profile: state.profile,
        trip: state.trip,
        searches: state.searches,
        preferences: state.preferences,
        stage: state.stage,
        messageCount: state.messageCount,
        sessionStartedAt: state.sessionStartedAt,
        lastActiveAt: state.lastActiveAt,
      }),
    },
  ),
);

// ── Selector hooks (prevent unnecessary re-renders) ────────────────────────────
export const useStage = () => useMemoryStore(s => s.stage);
export const useMessages = () => useMemoryStore(s => s.messages);
export const useTripMemory = () => useMemoryStore(s => s.trip);
export const useUserProfile = () => useMemoryStore(s => s.profile);
export const useSearchHistory = () => useMemoryStore(s => s.searches);
export const usePreferences = () => useMemoryStore(s => s.preferences);
export const useSessionId = () => useMemoryStore(s => s.sessionId);

// ── Derived selectors ──────────────────────────────────────────────────────────
export const useTripCompleteness = () => useMemoryStore(s => {
  const t = s.trip;
  const fields = [t.destination, t.originCity, t.startDate, t.endDate, t.adults > 0];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
});

export const useIsItineraryReady = () => useMemoryStore(s => !!s.trip.itineraryId);
export const useIsItineraryApproved = () => useMemoryStore(s => s.trip.itineraryApproved);

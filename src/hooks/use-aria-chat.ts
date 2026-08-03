'use client';
// ─────────────────────────────────────────────────────────────────────────────
// useAriaChat — central hook that powers the entire conversation flow.
// Connects the memory store, API, and all UI states.
// ─────────────────────────────────────────────────────────────────────────────

import * as React from 'react';
import toast from 'react-hot-toast';
import { useMemoryStore } from '@/engines/memory/store';
import type { ChatMessage, QuickReply, ConversationStage } from '@/types/conversation';
import type { Itinerary } from '@/types/itinerary';
import type { FlightOffer } from '@/types/flight';
import type { HotelOffer } from '@/types/hotel';
import type { ActivityOffer } from '@/types/activity';
import type { TripSummary } from '@/types/booking';
import { generateId } from '@/lib/utils';
import { API_ROUTES, ARIA_GREETING } from '@/lib/constants';

export function useAriaChat() {
  const store = useMemoryStore();

  // ── Local UI state (not persisted) ────────────────────────────────────────
  const [isLoading, setIsLoading] = React.useState(false);
  const [itinerary, setItinerary] = React.useState<Itinerary | null>(null);
  const [flights, setFlights] = React.useState<FlightOffer[]>([]);
  const [hotels, setHotels] = React.useState<HotelOffer[]>([]);
  const [activities, setActivities] = React.useState<ActivityOffer[]>([]);
  const [selectedFlight, setSelectedFlight] = React.useState<FlightOffer | null>(null);
  const [selectedHotel, setSelectedHotel] = React.useState<HotelOffer | null>(null);
  const [selectedActivities, setSelectedActivities] = React.useState<ActivityOffer[]>([]);
  const [tripSummary, setTripSummary] = React.useState<TripSummary | null>(null);

  // ── Bootstrap greeting ─────────────────────────────────────────────────────
  React.useEffect(() => {
    if (store.messages.length === 0) {
      store.addMessage({
        id: generateId(),
        role: 'assistant',
        content: ARIA_GREETING,
        type: 'text',
        timestamp: new Date(),
        quickReplies: [
          { id: 'beach',     label: '🏖️ Beach vacation',     value: 'I want a beach vacation' },
          { id: 'city',      label: '🏙️ City break',          value: 'I\'d love a city break' },
          { id: 'adventure', label: '🏔️ Adventure trip',      value: 'Adventure trip please!' },
          { id: 'culture',   label: '🎭 Culture & history',    value: 'Culture and history is my thing' },
          { id: 'luxury',    label: '✨ Luxury escape',        value: 'I want a luxury escape' },
          { id: 'surprise',  label: '🎲 Surprise me!',        value: 'Surprise me with a destination!' },
        ],
      });
      store.setStage('discover');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Main send handler ──────────────────────────────────────────────────────
  const sendMessage = React.useCallback(async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    // Add user message immediately
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: userText,
      type: 'text',
      timestamp: new Date(),
    };
    store.addMessage(userMsg);
    store.touchSession();
    setIsLoading(true);

    // Optimistic loading bubble
    const loadingId = generateId();
    store.addMessage({ id: loadingId, role: 'assistant', content: '', type: 'loading', timestamp: new Date() });

    try {
      const res = await fetch(API_ROUTES.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          sessionId: store.sessionId,
          stage: store.stage,
          trip: store.trip,
          profile: store.profile,
          messageHistory: store.messages.slice(-20).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data = await res.json();

      // Remove loading bubble
      store.updateLastMessage(msg => msg.id === loadingId ? { ...msg, type: 'text', content: '' } : msg);

      // Update stage & trip context
      const nextStage: ConversationStage = data.nextStage ?? store.stage;
      store.setStage(nextStage);

      // Persist extracted entities
      if (data.extracted) {
        const ex = data.extracted;
        if (ex.destination) store.setDestination(ex.destination);
        if (ex.originCity) store.setOriginCity(ex.originCity);
        if (ex.durationDays) store.setDuration(ex.durationDays);
        if (ex.adults) store.setTravelers(ex.adults, ex.children ?? store.trip.children);
        if (ex.budget) store.setBudget(ex.budget, ex.currency);
      }

      // Handle itinerary
      let msgItinerary: Itinerary | undefined;
      if (data.itinerary) {
        setItinerary(data.itinerary);
        store.setItinerary(data.itinerary);
        msgItinerary = data.itinerary;
      }

      // Add assistant response
      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.content ?? '',
        type: 'text',
        timestamp: new Date(),
        quickReplies: data.quickReplies ?? [],
        metadata: {
          stage: nextStage,
          itinerary: msgItinerary,
        },
      };
      store.updateLastMessage(() => assistantMsg);

      // Auto-search after stage transitions
      if (data.shouldSearchFlights) await searchFlights();
      if (data.shouldSearchHotels) await searchHotels();
      if (data.shouldSearchActivities) await searchActivities();

    } catch (err) {
      console.error('[useAriaChat]', err);
      store.updateLastMessage(() => ({
        id: loadingId,
        role: 'assistant',
        content: 'I\'m having a moment — could you try again? 😊',
        type: 'text',
        timestamp: new Date(),
      }));
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, store]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Quick reply ────────────────────────────────────────────────────────────
  const handleQuickReply = React.useCallback((reply: QuickReply) => {
    sendMessage(reply.value);
  }, [sendMessage]);

  // ── Approve itinerary ──────────────────────────────────────────────────────
  const approveItinerary = React.useCallback(async () => {
    store.approveItinerary();
    if (itinerary) setItinerary(prev => prev ? { ...prev, approved: true } : prev);
    store.setStage('search_flights');
    await sendMessage('This itinerary looks perfect — let\'s book it!');
  }, [itinerary, sendMessage, store]);

  // ── Edit itinerary ─────────────────────────────────────────────────────────
  const editItinerary = React.useCallback((change: string) => {
    sendMessage(change);
  }, [sendMessage]);

  // ── Flight search ──────────────────────────────────────────────────────────
  const searchFlights = React.useCallback(async () => {
    if (!store.trip.destination || !store.trip.startDate) return;
    try {
      const res = await fetch(API_ROUTES.flights, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: store.trip.originCity?.substring(0, 3).toUpperCase() ?? 'JFK',
          destination: itinerary?.destinationCode ?? store.trip.destination.substring(0, 3).toUpperCase(),
          departureDate: store.trip.startDate,
          returnDate: store.trip.endDate,
          adults: store.trip.adults,
          children: store.trip.children,
          cabinClass: store.profile.cabinClassPreference ?? 'economy',
          currency: store.trip.currency ?? 'USD',
        }),
      });
      const data = await res.json();
      const flightList: FlightOffer[] = data.data ?? [];
      setFlights(flightList);

      // Inject flight results into last message metadata
      store.addMessage({
        id: generateId(),
        role: 'assistant',
        content: `I've found ${flightList.length} flights for your trip! ✈️ Here are the best options — the first one is the best value.`,
        type: 'flight_results',
        timestamp: new Date(),
        metadata: { flights: flightList },
        quickReplies: [
          { id: 'cheapest', label: '💰 Most affordable', value: 'Show me the cheapest option' },
          { id: 'fastest',  label: '⚡ Fastest route',   value: 'I want the fastest route' },
          { id: 'direct',   label: '✈️ Direct only',     value: 'Show direct flights only' },
        ],
      });
    } catch (err) {
      console.error('[searchFlights]', err);
    }
  }, [store, itinerary]);

  // ── Hotel search ───────────────────────────────────────────────────────────
  const searchHotels = React.useCallback(async () => {
    if (!store.trip.destination || !store.trip.startDate || !store.trip.endDate) return;
    try {
      const res = await fetch(API_ROUTES.hotels, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: store.trip.destination,
          checkIn: store.trip.startDate,
          checkOut: store.trip.endDate,
          adults: store.trip.adults,
          children: store.trip.children,
          currency: store.trip.currency ?? 'USD',
        }),
      });
      const data = await res.json();
      const hotelList: HotelOffer[] = data.data ?? [];
      setHotels(hotelList);

      store.addMessage({
        id: generateId(),
        role: 'assistant',
        content: `Here are my top hotel picks in ${store.trip.destination}! 🏨 I've chosen them based on location, reviews, and how well they fit your planned itinerary.`,
        type: 'hotel_results',
        timestamp: new Date(),
        metadata: { hotels: hotelList },
        quickReplies: [
          { id: 'central', label: '🗺️ Most central',  value: 'Which is most central?' },
          { id: 'rated',   label: '⭐ Best rated',     value: 'Show the best rated option' },
          { id: 'value',   label: '💰 Best value',     value: 'Which is the best value?' },
        ],
      });
    } catch (err) {
      console.error('[searchHotels]', err);
    }
  }, [store]);

  // ── Activity search ────────────────────────────────────────────────────────
  const searchActivities = React.useCallback(async () => {
    if (!store.trip.destination || !store.trip.startDate) return;
    try {
      const res = await fetch(API_ROUTES.activities, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: store.trip.destination,
          startDate: store.trip.startDate,
          endDate: store.trip.endDate,
          adults: store.trip.adults,
          children: store.trip.children,
          interests: store.profile.interests,
          currency: store.trip.currency ?? 'USD',
        }),
      });
      const data = await res.json();
      const actList: ActivityOffer[] = data.data ?? [];
      setActivities(actList);

      store.addMessage({
        id: generateId(),
        role: 'assistant',
        content: `Now for the fun part — here are some amazing experiences in ${store.trip.destination}! 🎭 I've picked activities that complement your itinerary perfectly.`,
        type: 'activity_results',
        timestamp: new Date(),
        metadata: { activities: actList },
        quickReplies: [
          { id: 'add-all', label: '🎉 Add highlights', value: 'Add the top experiences' },
          { id: 'skip',    label: '⏭️ Skip activities', value: 'I\'ll book activities myself' },
        ],
      });
    } catch (err) {
      console.error('[searchActivities]', err);
    }
  }, [store]);

  // ── Selection handlers ────────────────────────────────────────────────────
  const selectFlight = React.useCallback((flight: FlightOffer) => {
    setSelectedFlight(flight);
    store.setSelectedFlight(flight);
    store.setStage('search_hotels');
    store.addMessage({
      id: generateId(),
      role: 'assistant',
      content: `Great choice! ✈️ ${flight.outbound.segments[0].airline.name} ${flight.outbound.segments[0].flightNumber} is booked for you.\n\nNow let's find the perfect hotel in ${store.trip.destination}!`,
      type: 'text',
      timestamp: new Date(),
    });
    searchHotels();
  }, [store, searchHotels]);

  const selectHotel = React.useCallback((hotel: HotelOffer) => {
    setSelectedHotel(hotel);
    store.setSelectedHotel(hotel);
    store.setStage('search_activities');
    store.addMessage({
      id: generateId(),
      role: 'assistant',
      content: `Excellent choice! 🏨 ${hotel.name} is a wonderful pick — ${hotel.ariaRecommendationNote ?? 'you\'ll love it there.'}\n\nFinally, let's add some unforgettable experiences to your trip!`,
      type: 'text',
      timestamp: new Date(),
    });
    searchActivities();
  }, [store, searchActivities]);

  const toggleActivity = React.useCallback((activity: ActivityOffer) => {
    setSelectedActivities(prev => {
      const exists = prev.find(a => a.id === activity.id);
      if (exists) {
        store.removeSelectedActivity(activity.id);
        return prev.filter(a => a.id !== activity.id);
      }
      store.addSelectedActivity(activity);
      return [...prev, activity];
    });
  }, [store]);

  // ── Build trip summary ────────────────────────────────────────────────────
  const buildTripSummary = React.useCallback(() => {
    if (!selectedFlight && !selectedHotel && selectedActivities.length === 0) return;

    const flightCost = selectedFlight?.price.total ?? 0;
    const hotelCost = selectedHotel?.rooms[0]?.price.total ?? 0;
    const actCost = selectedActivities.reduce((sum, a) => sum + a.price.adult * store.trip.adults, 0);
    const foodEst = Math.round((store.trip.durationDays ?? 7) * 60 * store.trip.adults);
    const transportEst = Math.round((store.trip.durationDays ?? 7) * 30);
    const taxes = Math.round((flightCost + hotelCost + actCost) * 0.08);
    const total = flightCost + hotelCost + actCost + foodEst + transportEst + taxes;

    const summary: TripSummary = {
      tripId: generateId(),
      destination: store.trip.destination ?? '',
      originCity: store.trip.originCity ?? '',
      startDate: store.trip.startDate ?? '',
      endDate: store.trip.endDate ?? '',
      durationDays: store.trip.durationDays ?? 7,
      travelers: { adults: store.trip.adults, children: store.trip.children, infants: store.trip.infants, total: store.trip.adults + store.trip.children },
      flight: selectedFlight ?? undefined,
      hotel: selectedHotel ?? undefined,
      activities: selectedActivities,
      totalCost: {
        flights: flightCost,
        hotel: hotelCost,
        activities: actCost,
        estimatedFood: foodEst,
        estimatedTransport: transportEst,
        estimatedMisc: 0,
        subtotal: total - taxes,
        taxes,
        total,
        currency: store.trip.currency ?? 'USD',
        perPerson: Math.round(total / Math.max(store.trip.adults, 1)),
      },
      itinerary: itinerary ?? undefined,
      status: 'planning',
      bookings: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTripSummary(summary);
    store.setStage('trip_summary');
    store.addMessage({
      id: generateId(),
      role: 'assistant',
      content: `🎊 Here's your complete trip summary! Everything is looking fantastic.\n\nWhen you're ready, hit "Confirm & Book" and I'll guide you through the checkout.`,
      type: 'trip_summary',
      timestamp: new Date(),
      metadata: { tripSummary: summary },
    });
  }, [selectedFlight, selectedHotel, selectedActivities, store, itinerary]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetSession = React.useCallback(() => {
    store.resetSession();
    setItinerary(null);
    setFlights([]);
    setHotels([]);
    setActivities([]);
    setSelectedFlight(null);
    setSelectedHotel(null);
    setSelectedActivities([]);
    setTripSummary(null);
    // Re-add greeting
    setTimeout(() => {
      store.addMessage({
        id: generateId(),
        role: 'assistant',
        content: ARIA_GREETING,
        type: 'text',
        timestamp: new Date(),
        quickReplies: [
          { id: 'beach', label: '🏖️ Beach vacation', value: 'I want a beach vacation' },
          { id: 'city',  label: '🏙️ City break',     value: 'I\'d love a city break' },
        ],
      });
      store.setStage('discover');
    }, 100);
  }, [store]);

  return {
    // State
    messages: store.messages,
    stage: store.stage,
    trip: store.trip,
    profile: store.profile,
    isLoading,
    itinerary,
    flights,
    hotels,
    activities,
    selectedFlight,
    selectedHotel,
    selectedActivities,
    tripSummary,
    // Actions
    sendMessage,
    handleQuickReply,
    approveItinerary,
    editItinerary,
    selectFlight,
    selectHotel,
    toggleActivity,
    buildTripSummary,
    searchFlights,
    searchHotels,
    searchActivities,
    resetSession,
  };
}

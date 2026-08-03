import { transition, getStageProgress } from '@/engines/conversation/state-machine';
import type { TripMemory } from '@/types/memory';

const emptyTrip: TripMemory = {
  destinationHierarchy: [],
  adults: 1,
  children: 0,
  infants: 0,
  currency: 'USD',
  itineraryApproved: false,
  selectedActivityIds: [],
};

const fullTrip: TripMemory = {
  ...emptyTrip,
  destination: 'Paris',
  originCity: 'New York',
  startDate: '2025-09-15',
  endDate: '2025-09-22',
  durationDays: 7,
  adults: 2,
  budget: 5000,
};

describe('State Machine', () => {
  describe('transition()', () => {
    it('moves from greeting to discover on greet intent', () => {
      const result = transition({ currentStage: 'greeting', intent: 'greet', trip: emptyTrip });
      expect(result.nextStage).toBe('discover');
    });

    it('moves to collecting_details after narrow_destination', () => {
      const result = transition({ currentStage: 'narrow_destination', intent: 'narrow_destination', trip: { ...emptyTrip, destination: 'Lisbon' } });
      expect(result.nextStage).toBe('collecting_details');
    });

    it('flags shouldGenerateItinerary when all fields present', () => {
      const result = transition({ currentStage: 'collecting_details', intent: 'provide_budget', trip: fullTrip });
      expect(result.shouldGenerateItinerary).toBe(true);
      expect(result.nextStage).toBe('generating_itinerary');
    });

    it('returns missing fields when destination absent', () => {
      const result = transition({ currentStage: 'collecting_details', intent: 'provide_dates', trip: emptyTrip });
      expect(result.missingFields.some(f => f.field === 'destination')).toBe(true);
    });

    it('flags shouldSearchFlights on approve_itinerary', () => {
      const result = transition({ currentStage: 'approve_itinerary', intent: 'approve_itinerary', trip: fullTrip });
      expect(result.shouldSearchFlights).toBe(true);
      expect(result.nextStage).toBe('search_flights');
    });

    it('moves to search_hotels after select_flight', () => {
      const result = transition({ currentStage: 'select_flight', intent: 'select_flight', trip: fullTrip });
      expect(result.nextStage).toBe('search_hotels');
      expect(result.shouldSearchHotels).toBe(true);
    });
  });

  describe('getStageProgress()', () => {
    it('returns 0 for greeting', () => {
      expect(getStageProgress('greeting')).toBe(0);
    });

    it('returns 100 for completed', () => {
      expect(getStageProgress('completed')).toBe(100);
    });

    it('returns increasing values as stages progress', () => {
      const p1 = getStageProgress('discover');
      const p2 = getStageProgress('collecting_details');
      const p3 = getStageProgress('search_flights');
      expect(p1).toBeLessThan(p2);
      expect(p2).toBeLessThan(p3);
    });
  });
});

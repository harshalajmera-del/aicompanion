import { generateItinerary } from '@/engines/itinerary/generator';
import { applyEdit, approveItinerary } from '@/engines/itinerary/editor';
import type { TripMemory } from '@/types/memory';
import type { UserProfile } from '@/types/memory';

const tripParis: TripMemory = {
  destination: 'Paris',
  originCity: 'New York',
  startDate: '2025-09-15',
  endDate: '2025-09-22',
  durationDays: 7,
  adults: 2,
  children: 0,
  infants: 0,
  budget: 5000,
  currency: 'USD',
  itineraryApproved: false,
  selectedActivityIds: [],
  destinationHierarchy: ['France', 'Paris'],
};

const profile: UserProfile = {
  interests: ['culture', 'food'],
  travelerType: 'couple',
  budgetTier: 'moderate',
};

describe('Itinerary Generator', () => {
  describe('generateItinerary()', () => {
    it('generates an itinerary with correct day count', () => {
      const itin = generateItinerary({ trip: tripParis, profile });
      expect(itin.days).toHaveLength(7);
    });

    it('sets correct destination and origin', () => {
      const itin = generateItinerary({ trip: tripParis, profile });
      expect(itin.destination).toBe('Paris');
      expect(itin.originCity).toBe('New York');
    });

    it('generates all required day sections', () => {
      const itin = generateItinerary({ trip: tripParis, profile });
      const day = itin.days[0];
      expect(day.morning).toBeDefined();
      expect(day.afternoon).toBeDefined();
      expect(day.evening).toBeDefined();
      expect(day.meals.length).toBeGreaterThan(0);
      expect(day.weather).toBeDefined();
    });

    it('sets version to 1 for new itinerary', () => {
      const itin = generateItinerary({ trip: tripParis, profile });
      expect(itin.version).toBe(1);
    });

    it('sets approved to false initially', () => {
      const itin = generateItinerary({ trip: tripParis, profile });
      expect(itin.approved).toBe(false);
    });

    it('calculates budget breakdown', () => {
      const itin = generateItinerary({ trip: tripParis, profile });
      expect(itin.budget.total).toBe(5000);
      expect(itin.budget.accommodation).toBeGreaterThan(0);
      expect(itin.budget.food).toBeGreaterThan(0);
    });

    it('includes transport disclaimer', () => {
      const itin = generateItinerary({ trip: tripParis, profile });
      expect(itin.transportDisclaimer).toContain('Transportation');
    });

    it('falls back gracefully for unknown destination', () => {
      const trip = { ...tripParis, destination: 'Narnia' };
      const itin = generateItinerary({ trip, profile });
      expect(itin.days).toHaveLength(7);
    });
  });

  describe('approveItinerary()', () => {
    it('marks itinerary as approved', () => {
      const itin = generateItinerary({ trip: tripParis, profile });
      const approved = approveItinerary(itin);
      expect(approved.approved).toBe(true);
    });

    it('marks all days as accepted', () => {
      const itin = generateItinerary({ trip: tripParis, profile });
      const approved = approveItinerary(itin);
      expect(approved.days.every(d => d.accepted)).toBe(true);
    });
  });

  describe('applyEdit()', () => {
    it('changes dates without regenerating content', () => {
      const itin = generateItinerary({ trip: tripParis, profile });
      const newTrip = { ...tripParis, startDate: '2025-10-01' };
      const result = applyEdit(itin, { itineraryId: itin.id, type: 'change_dates' }, newTrip, profile);
      expect(result.itinerary.startDate).toBe('2025-10-01');
      expect(result.itinerary.version).toBe(2);
    });

    it('adds a day and increments duration', () => {
      const itin = generateItinerary({ trip: tripParis, profile });
      const newTrip = { ...tripParis, durationDays: 8 };
      const result = applyEdit(itin, { itineraryId: itin.id, type: 'add_day' }, newTrip, profile);
      expect(result.itinerary.days).toHaveLength(8);
    });

    it('removes a day and decrements duration', () => {
      const itin = generateItinerary({ trip: tripParis, profile });
      const dayId = itin.days[itin.days.length - 1].id;
      const result = applyEdit(itin, { itineraryId: itin.id, type: 'remove_day', dayId }, tripParis, profile);
      expect(result.itinerary.days).toHaveLength(6);
    });

    it('replaces a day activity while preserving others', () => {
      const itin = generateItinerary({ trip: tripParis, profile });
      const dayId = itin.days[0].id;
      const original = itin.days[0];
      const result = applyEdit(itin, { itineraryId: itin.id, type: 'replace_day_activity', dayId }, tripParis, profile);
      expect(result.changedDayIds).toContain(dayId);
      // Other days untouched
      expect(result.itinerary.days[1]).toEqual(itin.days[1]);
    });
  });
});

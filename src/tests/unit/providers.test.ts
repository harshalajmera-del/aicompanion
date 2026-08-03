import { MockFlightProvider } from '@/providers/flights/mock';
import { MockHotelProvider } from '@/providers/hotels/mock';
import { MockActivityProvider } from '@/providers/activities/mock';
import { MockWeatherProvider } from '@/providers/weather/mock';
import { MockDestinationProvider } from '@/providers/destinations/mock';
import { MockCurrencyProvider } from '@/providers/currency/mock';

const mockConfig = { mode: 'mock' as const };

describe('Mock Providers', () => {
  describe('MockFlightProvider', () => {
    const provider = new MockFlightProvider(mockConfig);

    it('returns flight offers for a route', async () => {
      const result = await provider.search({
        origin: 'JFK', destination: 'CDG', departureDate: '2025-09-15',
        adults: 2, cabinClass: 'economy', currency: 'USD',
      });
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.provider).toBe('mock-flights');
    });

    it('returns sorted flights by price', async () => {
      const result = await provider.search({
        origin: 'JFK', destination: 'NRT', departureDate: '2025-09-15',
        adults: 1, cabinClass: 'economy', currency: 'USD',
      });
      const prices = result.data.map(f => f.price.total);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('includes airline info on each segment', async () => {
      const result = await provider.search({
        origin: 'LHR', destination: 'DPS', departureDate: '2025-10-01',
        adults: 1, cabinClass: 'business', currency: 'USD',
      });
      result.data.forEach(flight => {
        expect(flight.outbound.segments[0].airline.code).toBeTruthy();
        expect(flight.outbound.segments[0].airline.name).toBeTruthy();
      });
    });

    it('applies cabin class price multiplier', async () => {
      const [eco, biz] = await Promise.all([
        provider.search({ origin: 'JFK', destination: 'CDG', departureDate: '2025-09-15', adults: 1, cabinClass: 'economy', currency: 'USD' }),
        provider.search({ origin: 'JFK', destination: 'CDG', departureDate: '2025-09-15', adults: 1, cabinClass: 'business', currency: 'USD' }),
      ]);
      expect(biz.data[0].price.total).toBeGreaterThan(eco.data[0].price.total);
    });
  });

  describe('MockHotelProvider', () => {
    const provider = new MockHotelProvider(mockConfig);

    it('returns hotel offers', async () => {
      const result = await provider.search({
        destination: 'Paris', checkIn: '2025-09-15', checkOut: '2025-09-22', adults: 2, currency: 'USD',
      });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('each hotel has rooms, images, and amenities', async () => {
      const result = await provider.search({
        destination: 'Tokyo', checkIn: '2025-10-01', checkOut: '2025-10-07', adults: 2, currency: 'USD',
      });
      result.data.forEach(hotel => {
        expect(hotel.rooms.length).toBeGreaterThan(0);
        expect(hotel.images.length).toBeGreaterThan(0);
        expect(hotel.amenities.length).toBeGreaterThan(0);
        expect(hotel.guestRating.overall).toBeGreaterThan(0);
      });
    });

    it('calculates nights correctly', async () => {
      const result = await provider.search({
        destination: 'Bali', checkIn: '2025-09-15', checkOut: '2025-09-22', adults: 2, currency: 'USD',
      });
      expect(result.data[0].nights).toBe(7);
    });
  });

  describe('MockActivityProvider', () => {
    const provider = new MockActivityProvider(mockConfig);

    it('returns activity offers', async () => {
      const result = await provider.search({
        destination: 'Paris', startDate: '2025-09-15', adults: 2, currency: 'USD',
      });
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('each activity has rating, price, and duration', async () => {
      const result = await provider.search({
        destination: 'Tokyo', startDate: '2025-10-01', adults: 2, currency: 'USD',
      });
      result.data.forEach(act => {
        expect(act.rating.score).toBeGreaterThan(0);
        expect(act.price.adult).toBeGreaterThan(0);
        expect(act.duration.minutes).toBeGreaterThan(0);
      });
    });
  });

  describe('MockWeatherProvider', () => {
    const provider = new MockWeatherProvider(mockConfig);

    it('returns weather data with forecast', async () => {
      const result = await provider.getWeather('Paris', '2025-09-15');
      expect(result.data.current).toBeDefined();
      expect(result.data.forecast.length).toBeGreaterThan(0);
    });

    it('returns 10 forecast days', async () => {
      const result = await provider.getWeather('Tokyo');
      expect(result.data.forecast).toHaveLength(10);
    });
  });

  describe('MockDestinationProvider', () => {
    const provider = new MockDestinationProvider(mockConfig);

    it('returns suggestions for a continent query', async () => {
      const result = await provider.suggest('Europe');
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('finds Paris by name', async () => {
      const result = await provider.suggest('Paris');
      expect(result.data.some(s => s.destination.name === 'Paris')).toBe(true);
    });

    it('returns sub-destinations for Portugal', async () => {
      const subs = await provider.getHierarchy('Portugal');
      expect(subs.data.length).toBeGreaterThan(0);
      expect(subs.data).toContain('Lisbon');
    });
  });

  describe('MockCurrencyProvider', () => {
    const provider = new MockCurrencyProvider(mockConfig);

    it('converts USD to EUR', async () => {
      const result = await provider.convert(1000, 'USD', 'EUR');
      expect(result.data.converted).toBeLessThan(1000); // EUR stronger than USD
      expect(result.data.from).toBe('USD');
      expect(result.data.to).toBe('EUR');
    });

    it('returns 1:1 for same currency', async () => {
      const result = await provider.convert(500, 'USD', 'USD');
      expect(result.data.converted).toBe(500);
      expect(result.data.rate).toBe(1);
    });
  });
});

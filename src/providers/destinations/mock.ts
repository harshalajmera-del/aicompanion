// ─────────────────────────────────────────────────────────────────────────────
// Mock Destination Provider
// Returns destination suggestions and hierarchy data.
// ─────────────────────────────────────────────────────────────────────────────

import { BaseProvider } from '../base';
import type { Destination, DestinationFilter, DestinationSuggestion } from '@/types/destination';
import type { ProviderResponse } from '@/types/provider';

const DESTINATIONS: Destination[] = [
  {
    id: 'paris', name: 'Paris', slug: 'paris', level: 'city', country: 'France',
    countryCode: 'FR', continent: 'Europe', region: 'Western Europe',
    coordinates: { lat: 48.8566, lng: 2.3522 }, airportCode: 'CDG',
    description: 'The City of Light — art, cuisine, romance, and iconic landmarks at every turn.',
    tagline: 'Where every street is a masterpiece',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
    highlights: ['Eiffel Tower', 'Louvre', 'Montmartre', 'Seine River'],
    tags: ['culture', 'food', 'romance', 'art', 'history'],
    bestMonths: [4, 5, 6, 9, 10],
    avgTemperatureC: { jan: 5, feb: 6, mar: 10, apr: 13, may: 17, jun: 20, jul: 23, aug: 22, sep: 19, oct: 14, nov: 9, dec: 6 },
    currency: 'EUR', language: ['French'], timezone: 'Europe/Paris',
    budgetTier: 'moderate', popularity: 98,
  },
  {
    id: 'tokyo', name: 'Tokyo', slug: 'tokyo', level: 'city', country: 'Japan',
    countryCode: 'JP', continent: 'Asia',
    coordinates: { lat: 35.6762, lng: 139.6503 }, airportCode: 'NRT',
    description: 'A city that never sleeps — where ancient temples share streets with robot restaurants and neon-lit skyscrapers.',
    tagline: 'The future, steeped in tradition',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
    highlights: ['Shibuya Crossing', 'Senso-ji', 'Shinjuku', 'Tsukiji Market'],
    tags: ['food', 'culture', 'technology', 'nightlife', 'shopping'],
    bestMonths: [3, 4, 10, 11],
    avgTemperatureC: { jan: 6, feb: 7, mar: 10, apr: 15, may: 20, jun: 23, jul: 27, aug: 29, sep: 24, oct: 18, nov: 13, dec: 8 },
    currency: 'JPY', language: ['Japanese'], timezone: 'Asia/Tokyo',
    budgetTier: 'moderate', popularity: 95,
  },
  {
    id: 'bali', name: 'Bali', slug: 'bali', level: 'island', country: 'Indonesia',
    countryCode: 'ID', continent: 'Asia', region: 'Southeast Asia',
    coordinates: { lat: -8.3405, lng: 115.0920 }, airportCode: 'DPS',
    description: 'The Island of the Gods — lush rice terraces, ancient temples, world-class surf, and unforgettable spirituality.',
    tagline: 'Where spirituality meets paradise',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    highlights: ['Ubud', 'Tanah Lot', 'Tegalalang', 'Seminyak Beach'],
    tags: ['beach', 'culture', 'nature', 'wellness', 'adventure'],
    bestMonths: [4, 5, 6, 7, 8, 9],
    avgTemperatureC: { jan: 26, feb: 26, mar: 27, apr: 28, may: 28, jun: 27, jul: 26, aug: 26, sep: 27, oct: 28, nov: 28, dec: 27 },
    currency: 'IDR', language: ['Balinese', 'Indonesian'], timezone: 'Asia/Makassar',
    budgetTier: 'budget', popularity: 92,
  },
  {
    id: 'barcelona', name: 'Barcelona', slug: 'barcelona', level: 'city', country: 'Spain',
    countryCode: 'ES', continent: 'Europe', region: 'Southern Europe',
    coordinates: { lat: 41.3851, lng: 2.1734 }, airportCode: 'BCN',
    description: 'Gaudí\'s masterpieces, Gothic Quarter charm, world-class food, and Mediterranean beaches — all in one city.',
    tagline: 'Art, sun, and endless tapas',
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    highlights: ['Sagrada Família', 'Park Güell', 'Las Ramblas', 'Barceloneta Beach'],
    tags: ['culture', 'food', 'beach', 'art', 'nightlife'],
    bestMonths: [4, 5, 6, 9, 10],
    avgTemperatureC: { jan: 10, feb: 11, mar: 13, apr: 16, may: 20, jun: 24, jul: 27, aug: 27, sep: 24, oct: 19, nov: 14, dec: 11 },
    currency: 'EUR', language: ['Catalan', 'Spanish'], timezone: 'Europe/Madrid',
    budgetTier: 'moderate', popularity: 94,
  },
  {
    id: 'santorini', name: 'Santorini', slug: 'santorini', level: 'island', country: 'Greece',
    countryCode: 'GR', continent: 'Europe', region: 'Southern Europe',
    coordinates: { lat: 36.3932, lng: 25.4615 }, airportCode: 'JTR',
    description: 'Blue-domed churches, whitewashed cliffs, caldera sunsets, and volcanic black-sand beaches.',
    tagline: 'The world\'s most iconic sunset',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
    highlights: ['Oia Sunset', 'Fira', 'Red Beach', 'Akrotiri ruins'],
    tags: ['beach', 'romance', 'luxury', 'photography', 'relaxation'],
    bestMonths: [5, 6, 9, 10],
    avgTemperatureC: { jan: 12, feb: 12, mar: 14, apr: 18, may: 22, jun: 27, jul: 29, aug: 29, sep: 25, oct: 21, nov: 17, dec: 14 },
    currency: 'EUR', language: ['Greek'], timezone: 'Europe/Athens',
    budgetTier: 'luxury', popularity: 93,
  },
  {
    id: 'maldives', name: 'Maldives', slug: 'maldives', level: 'country', country: 'Maldives',
    countryCode: 'MV', continent: 'Asia',
    coordinates: { lat: 3.2028, lng: 73.2207 }, airportCode: 'MLE',
    description: 'Overwater bungalows, crystal-clear lagoons, vibrant coral reefs, and absolute seclusion.',
    tagline: 'The ultimate barefoot luxury',
    imageUrl: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
    highlights: ['Overwater villas', 'Snorkeling', 'Private beaches', 'Dolphin cruises'],
    tags: ['beach', 'luxury', 'romance', 'relaxation', 'nature'],
    bestMonths: [1, 2, 3, 4, 11, 12],
    avgTemperatureC: { jan: 29, feb: 29, mar: 30, apr: 30, may: 29, jun: 29, jul: 28, aug: 28, sep: 29, oct: 29, nov: 29, dec: 29 },
    currency: 'MVR', language: ['Dhivehi'], timezone: 'Indian/Maldives',
    budgetTier: 'ultra-luxury', popularity: 90,
  },
  {
    id: 'new-york', name: 'New York City', slug: 'new-york', level: 'city', country: 'United States',
    countryCode: 'US', continent: 'Americas', region: 'North America',
    coordinates: { lat: 40.7128, lng: -74.0060 }, airportCode: 'JFK',
    description: 'The city that never sleeps — world-class museums, Broadway, iconic skylines, and the best pizza on earth.',
    tagline: 'If you can make it here, you can make it anywhere',
    imageUrl: 'https://images.unsplash.com/photo-1538970272646-f61fabb3a8a2?w=800',
    highlights: ['Central Park', 'Times Square', 'Brooklyn Bridge', 'MoMA'],
    tags: ['culture', 'food', 'shopping', 'nightlife', 'art'],
    bestMonths: [4, 5, 6, 9, 10],
    avgTemperatureC: { jan: 1, feb: 2, mar: 7, apr: 13, may: 19, jun: 24, jul: 28, aug: 27, sep: 22, oct: 16, nov: 10, dec: 4 },
    currency: 'USD', language: ['English'], timezone: 'America/New_York',
    budgetTier: 'luxury', popularity: 97,
  },
  {
    id: 'dubai', name: 'Dubai', slug: 'dubai', level: 'city', country: 'United Arab Emirates',
    countryCode: 'AE', continent: 'Middle East',
    coordinates: { lat: 25.2048, lng: 55.2708 }, airportCode: 'DXB',
    description: 'The city of superlatives — the tallest, largest, most extravagant. A desert metropolis pushing every boundary.',
    tagline: 'Where the impossible is just the beginning',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
    highlights: ['Burj Khalifa', 'Dubai Mall', 'Desert Safari', 'Palm Jumeirah'],
    tags: ['luxury', 'shopping', 'adventure', 'culture', 'nightlife'],
    bestMonths: [10, 11, 12, 1, 2, 3],
    avgTemperatureC: { jan: 19, feb: 21, mar: 24, apr: 29, may: 34, jun: 38, jul: 40, aug: 40, sep: 37, oct: 32, nov: 26, dec: 21 },
    currency: 'AED', language: ['Arabic', 'English'], timezone: 'Asia/Dubai',
    budgetTier: 'luxury', popularity: 91,
  },
];

// Hierarchy: broad regions → country → city
const DESTINATION_HIERARCHY: Record<string, string[]> = {
  europe: ['Paris', 'Barcelona', 'Rome', 'Amsterdam', 'Prague', 'Lisbon', 'Vienna', 'Santorini'],
  asia: ['Tokyo', 'Bali', 'Bangkok', 'Singapore', 'Seoul', 'Kyoto', 'Phuket'],
  'middle east': ['Dubai', 'Abu Dhabi', 'Muscat'],
  americas: ['New York City', 'Cancún', 'Buenos Aires', 'Rio de Janeiro'],
  africa: ['Marrakech', 'Cape Town', 'Zanzibar'],
  oceania: ['Sydney', 'Melbourne', 'Queenstown'],
  france: ['Paris', 'Nice', 'Lyon', 'Bordeaux', 'Marseille'],
  spain: ['Barcelona', 'Madrid', 'Seville', 'Valencia', 'Ibiza'],
  italy: ['Rome', 'Florence', 'Venice', 'Amalfi Coast', 'Sicily'],
  greece: ['Athens', 'Santorini', 'Mykonos', 'Rhodes', 'Crete'],
  portugal: ['Lisbon', 'Porto', 'Algarve', 'Madeira', 'Sintra', 'Douro Valley'],
  japan: ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima', 'Nara', 'Hokkaido'],
  indonesia: ['Bali', 'Lombok', 'Komodo', 'Raja Ampat'],
  thailand: ['Bangkok', 'Chiang Mai', 'Phuket', 'Koh Samui', 'Pai'],
};

export class MockDestinationProvider extends BaseProvider {
  async suggest(
    query: string,
    filter?: DestinationFilter,
  ): Promise<ProviderResponse<DestinationSuggestion[]>> {
    await this.randomDelay(200, 600);

    const lower = query.toLowerCase();

    // Check hierarchy first
    const hierarchyKey = Object.keys(DESTINATION_HIERARCHY).find(k => lower.includes(k));
    if (hierarchyKey) {
      const subDestNames = DESTINATION_HIERARCHY[hierarchyKey];
      const suggestions: DestinationSuggestion[] = subDestNames.slice(0, 6).map((name, i) => {
        const dest = DESTINATIONS.find(d => d.name.toLowerCase() === name.toLowerCase())
          ?? this.buildGenericDest(name);
        return {
          destination: dest,
          score: 0.9 - i * 0.05,
          reasons: this.getReasonsForDest(dest, filter),
          weatherNote: `Best visited: ${this.getBestMonthsLabel(dest.bestMonths)}`,
        };
      });
      return this.wrap(suggestions, 'mock-destinations');
    }

    // Direct destination match
    const matched = DESTINATIONS.filter(d =>
      d.name.toLowerCase().includes(lower) ||
      d.country.toLowerCase().includes(lower) ||
      d.continent.toLowerCase().includes(lower),
    );

    if (matched.length > 0) {
      return this.wrap(
        matched.slice(0, 6).map((d, i) => ({
          destination: d,
          score: 1 - i * 0.05,
          reasons: this.getReasonsForDest(d, filter),
        })),
        'mock-destinations',
      );
    }

    // Fallback — top popular destinations
    const filtered = this.filterDestinations(DESTINATIONS, filter);
    const suggestions: DestinationSuggestion[] = filtered.slice(0, 6).map((d, i) => ({
      destination: d,
      score: 0.85 - i * 0.04,
      reasons: this.getReasonsForDest(d, filter),
      budgetNote: `${d.budgetTier} tier`,
    }));

    return this.wrap(suggestions, 'mock-destinations');
  }

  async getHierarchy(destination: string): Promise<ProviderResponse<string[]>> {
    await this.randomDelay(100, 300);
    const lower = destination.toLowerCase();
    const key = Object.keys(DESTINATION_HIERARCHY).find(k => lower.includes(k) || k.includes(lower));
    const subs = key ? DESTINATION_HIERARCHY[key] : [];
    return this.wrap(subs, 'mock-destinations');
  }

  private filterDestinations(dests: Destination[], filter?: DestinationFilter): Destination[] {
    if (!filter) return dests;
    return dests.filter(d => {
      if (filter.budgetTier && d.budgetTier !== filter.budgetTier) return false;
      if (filter.continent && !d.continent.toLowerCase().includes(filter.continent.toLowerCase())) return false;
      if (filter.month && !d.bestMonths.includes(filter.month)) return false;
      if (filter.interests?.length) {
        const match = filter.interests.some(i => d.tags.includes(i));
        if (!match) return false;
      }
      return true;
    });
  }

  private getReasonsForDest(dest: Destination, filter?: DestinationFilter): string[] {
    const reasons: string[] = [];
    if (dest.tags.includes('romance') || dest.tags.includes('beach')) reasons.push('Perfect for couples');
    if (dest.tags.includes('food')) reasons.push('Outstanding culinary scene');
    if (dest.tags.includes('culture') || dest.tags.includes('history')) reasons.push('Rich cultural heritage');
    if (dest.budgetTier === 'budget') reasons.push('Great value for money');
    if (dest.budgetTier === 'luxury') reasons.push('World-class luxury experiences');
    if (reasons.length === 0) reasons.push('Highly recommended destination');
    return reasons.slice(0, 3);
  }

  private getBestMonthsLabel(months: number[]): string {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(m => names[m]).join(', ');
  }

  private buildGenericDest(name: string): Destination {
    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      level: 'city',
      country: 'Unknown',
      countryCode: 'XX',
      continent: 'Europe',
      coordinates: { lat: 0, lng: 0 },
      description: `${name} — a wonderful destination waiting to be explored.`,
      tagline: `Discover ${name}`,
      imageUrl: `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800`,
      highlights: [],
      tags: ['culture', 'sightseeing'],
      bestMonths: [4, 5, 6, 9, 10],
      avgTemperatureC: {},
      currency: 'EUR',
      language: ['Local'],
      timezone: 'Europe/Paris',
      budgetTier: 'moderate',
    };
  }
}

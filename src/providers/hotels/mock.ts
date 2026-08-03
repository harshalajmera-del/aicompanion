// ─────────────────────────────────────────────────────────────────────────────
// Mock Hotel Provider
// Returns rich, realistic hotel offers for any destination.
// ─────────────────────────────────────────────────────────────────────────────

import { BaseProvider } from '../base';
import type { HotelSearchParams, HotelOffer, RoomOffer, GuestRating } from '@/types/hotel';
import type { ProviderResponse } from '@/types/provider';
import { differenceInDays, parseISO } from 'date-fns';

const HOTEL_TEMPLATES = [
  {
    name: 'The Grand Central Hotel',
    brand: 'Marriott',
    stars: 5,
    neighborhood: 'City Centre',
    description: 'A landmark 5-star hotel in the heart of the city, blending classic elegance with contemporary luxury. Steps from the top attractions.',
    highlights: ['Rooftop infinity pool', 'Michelin-starred restaurant', 'Full-service spa', '24h concierge'],
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'bar', 'room_service', 'concierge', 'parking'] as const,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    pricePerNightBase: 380,
    walkability: 95,
    ariaNote: 'Ideal base for sightseeing — every major attraction within 15 minutes on foot.',
  },
  {
    name: 'Boutique Lumière',
    brand: undefined,
    stars: 4,
    neighborhood: 'Arts Quarter',
    description: 'An intimate boutique hotel with 28 individually designed rooms. Each floor celebrates a different local artist. Beloved by creatives.',
    highlights: ['Locally-curated art', 'Rooftop terrace bar', 'Artisan breakfast', 'Bicycle rental'],
    amenities: ['wifi', 'restaurant', 'bar', 'concierge', 'rooftop'] as const,
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    pricePerNightBase: 195,
    walkability: 88,
    ariaNote: 'Perfect for travellers who want a local, authentic experience away from the tourist crowds.',
  },
  {
    name: 'Harbour View Suites',
    brand: 'Hilton',
    stars: 4,
    neighborhood: 'Waterfront',
    description: 'Modern suites with panoramic water views. The rooftop bar at sunset is an experience in itself.',
    highlights: ['Floor-to-ceiling harbour views', 'Rooftop bar', 'Direct waterfront access', 'Complimentary kayaks'],
    amenities: ['wifi', 'pool', 'gym', 'restaurant', 'bar', 'room_service', 'rooftop'] as const,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    pricePerNightBase: 265,
    walkability: 82,
    ariaNote: 'The harbour view suite on Floor 12 is worth the upgrade — the sunrise is extraordinary.',
  },
  {
    name: 'The Heritage Inn',
    brand: undefined,
    stars: 3,
    neighborhood: 'Old Town',
    description: 'A lovingly restored 19th-century townhouse. Exposed stone walls, creaking wooden floors, and genuine character.',
    highlights: ['Historic building', 'Garden courtyard', 'Homemade breakfast', 'Family-run'],
    amenities: ['wifi', 'restaurant', 'parking', 'accessible'] as const,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
    pricePerNightBase: 110,
    walkability: 90,
    ariaNote: 'Best value option. The breakfast alone is worth staying here — fresh local produce daily.',
  },
  {
    name: 'Palacio del Sol Resort',
    brand: 'Marriott',
    stars: 5,
    neighborhood: 'Beach District',
    description: 'A sprawling beachfront resort with six pools, four restaurants, and a private beach. The ultimate luxury escape.',
    highlights: ['Private beach', 'Six pools', 'World-class spa', 'Four restaurants', 'Kids club'],
    amenities: ['wifi', 'pool', 'spa', 'gym', 'restaurant', 'bar', 'beach_access', 'room_service', 'concierge', 'parking', 'pet_friendly'] as const,
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
    pricePerNightBase: 520,
    walkability: 65,
    ariaNote: 'A destination in itself. Ideal if you want a resort experience where you can relax between city excursions.',
  },
  {
    name: 'Urban Garden Hotel',
    brand: 'Hyatt',
    stars: 4,
    neighborhood: 'Design District',
    description: 'A sustainably-designed hotel celebrating green architecture. 200 plant species in the lobby, rooftop urban farm, and zero single-use plastic.',
    highlights: ['Rooftop urban farm', 'Eco-certified', 'Vertical garden lobby', 'Electric vehicle charging'],
    amenities: ['wifi', 'gym', 'restaurant', 'bar', 'rooftop', 'accessible'] as const,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    pricePerNightBase: 220,
    walkability: 85,
    ariaNote: 'A great choice for eco-conscious travellers. The rooftop restaurant uses produce grown on-site.',
  },
];

const ROOM_TYPES = ['Standard Double', 'Deluxe King', 'Junior Suite', 'Executive Suite', 'Penthouse'];

export class MockHotelProvider extends BaseProvider {
  async search(params: HotelSearchParams): Promise<ProviderResponse<HotelOffer[]>> {
    await this.randomDelay(700, 1400);

    const nights = differenceInDays(parseISO(params.checkOut), parseISO(params.checkIn));
    const numResults = Math.min(params.maxResults ?? 6, HOTEL_TEMPLATES.length);

    const offers: HotelOffer[] = HOTEL_TEMPLATES.slice(0, numResults).map((tpl, i) => {
      const pricePerNight = Math.round(tpl.pricePerNightBase * (0.9 + i * 0.05) * (params.adults / 2 > 1 ? 1.15 : 1));
      const total = pricePerNight * nights;
      const taxes = Math.round(total * 0.12);

      const guestScore = 7.5 + (tpl.stars - 3) * 0.5 + (Math.random() * 0.8);
      const rating: GuestRating = {
        overall: Math.min(10, parseFloat(guestScore.toFixed(1))),
        label: guestScore >= 9 ? 'Exceptional' : guestScore >= 8 ? 'Excellent' : guestScore >= 7 ? 'Very Good' : 'Good',
        reviewCount: this.randomBetween(200, 4800),
        cleanliness: parseFloat((guestScore + 0.2).toFixed(1)),
        comfort: parseFloat((guestScore + 0.1).toFixed(1)),
        location: parseFloat((guestScore + 0.3).toFixed(1)),
        facilities: parseFloat((guestScore - 0.1).toFixed(1)),
        staff: parseFloat((guestScore + 0.4).toFixed(1)),
      };

      const rooms: RoomOffer[] = ROOM_TYPES.slice(0, 3).map((type, ri) => ({
        id: `room_${i}_${ri}`,
        type,
        description: `Spacious ${type} with city views and premium amenities.`,
        maxOccupancy: ri === 0 ? 2 : ri === 1 ? 3 : 4,
        bedType: ri === 0 ? 'Queen' : 'King',
        size: `${25 + ri * 15}m²`,
        amenities: ['Air conditioning', 'Mini bar', 'Safe', 'Smart TV', 'Premium toiletries'],
        price: {
          perNight: pricePerNight * (1 + ri * 0.35),
          total: total * (1 + ri * 0.35) + taxes,
          taxes,
          currency: params.currency ?? 'USD',
          originalPrice: ri === 0 ? pricePerNight * 1.15 : undefined,
          discount: ri === 0 ? 15 : undefined,
        },
        available: true,
        boardType: 'breakfast',
        cancellationPolicy: {
          type: i % 3 === 0 ? 'free' : 'non-refundable',
          freeCancellationUntil: i % 3 === 0 ? params.checkIn : undefined,
          description: i % 3 === 0 ? 'Free cancellation until check-in date' : 'Non-refundable',
        },
      }));

      return {
        id: `hotel_${this.id()}`,
        provider: 'mock',
        name: tpl.name,
        brand: tpl.brand,
        starRating: tpl.stars,
        guestRating: rating,
        neighborhood: tpl.neighborhood,
        address: {
          city: params.destination,
          country: 'France',
          countryCode: 'FR',
          fullAddress: `1${i + 1} ${tpl.neighborhood} Street, ${params.destination}`,
        },
        coordinates: {
          lat: 48.8566 + (i * 0.008),
          lng: 2.3522 + (i * 0.006),
        },
        images: [
          { url: tpl.image, alt: tpl.name, category: 'exterior' },
          { url: `https://images.unsplash.com/photo-${1566073771259 + i * 1000}?w=800`, alt: 'Room', category: 'room' },
        ],
        description: tpl.description,
        highlights: tpl.highlights,
        amenities: tpl.amenities as unknown as import('@/types/hotel').HotelAmenity[],
        rooms,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        nights,
        cancellationPolicy: {
          type: i % 3 === 0 ? 'free' : 'non-refundable',
          freeCancellationUntil: i % 3 === 0 ? params.checkIn : undefined,
          description: i % 3 === 0 ? 'Free cancellation until check-in' : 'Non-refundable',
        },
        mealPlan: 'breakfast',
        nearbyAttractions: [
          { name: 'City Museum', distance: `${0.3 + i * 0.2} km`, walkingMinutes: 4 + i * 2, type: 'Museum' },
          { name: 'Central Park', distance: `${0.5 + i * 0.3} km`, walkingMinutes: 7 + i * 3, type: 'Park' },
          { name: 'Main Square', distance: `${0.8 + i * 0.4} km`, walkingMinutes: 10 + i * 4, type: 'Landmark' },
        ],
        walkabilityScore: tpl.walkability,
        transitAccess: 'Metro station 3 minutes walk',
        ariaRecommendationNote: tpl.ariaNote,
        searchedAt: new Date().toISOString(),
      };
    });

    return this.wrap(offers, 'mock-hotels');
  }
}

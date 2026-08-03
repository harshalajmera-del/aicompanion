// ─────────────────────────────────────────────────────────────────────────────
// Mock Activity Provider
// Returns curated experiences grouped by itinerary day.
// ─────────────────────────────────────────────────────────────────────────────

import { BaseProvider } from '../base';
import type { ActivitySearchParams, ActivityOffer, ActivityOfferCategory } from '@/types/activity';
import type { ProviderResponse } from '@/types/provider';

const ACTIVITY_TEMPLATES: Array<{
  name: string; category: ActivityOfferCategory; description: string;
  shortDesc: string; priceAdult: number; durationMins: number;
  maxGroup: number; rating: number; reviewCount: number; tags: string[];
  imageSlug: string;
}> = [
  {
    name: 'Classic City Walking Tour',
    category: 'tour',
    description: 'Explore the city\'s most iconic landmarks with an expert local guide. Covers history, architecture, hidden alleys, and the best photo spots.',
    shortDesc: '3-hour guided walking tour of the city highlights.',
    priceAdult: 35,
    durationMins: 180,
    maxGroup: 12,
    rating: 4.8,
    reviewCount: 3241,
    tags: ['history', 'culture', 'photography'],
    imageSlug: 'photo-1467269204594-9661b134dd2b',
  },
  {
    name: 'Food & Wine Tasting Experience',
    category: 'food_drink',
    description: 'Taste your way through the local food scene with a passionate foodie guide. Includes 8 tastings at authentic spots you\'d never find alone.',
    shortDesc: '4-hour culinary tour with wine pairing.',
    priceAdult: 89,
    durationMins: 240,
    maxGroup: 8,
    rating: 4.9,
    reviewCount: 1876,
    tags: ['food', 'wine', 'local'],
    imageSlug: 'photo-1414235077428-338989a2e8c0',
  },
  {
    name: 'Sunrise Kayak Adventure',
    category: 'adventure',
    description: 'Paddle through the city\'s waterways at dawn before the crowds arrive. Watch the city wake up from the water. Equipment and breakfast included.',
    shortDesc: 'Early morning kayak tour with breakfast.',
    priceAdult: 65,
    durationMins: 180,
    maxGroup: 10,
    rating: 4.7,
    reviewCount: 892,
    tags: ['adventure', 'nature', 'morning'],
    imageSlug: 'photo-1506905925346-21bda4d32df4',
  },
  {
    name: 'Skip-the-Line Museum Pass',
    category: 'museum',
    description: 'Priority access to the city\'s top 5 museums. No queuing — walk straight in. Valid for 3 consecutive days. Audio guide included.',
    shortDesc: 'Multi-museum skip-the-line pass (3 days).',
    priceAdult: 55,
    durationMins: 480,
    maxGroup: 99,
    rating: 4.6,
    reviewCount: 5432,
    tags: ['museum', 'art', 'history'],
    imageSlug: 'photo-1533929736458-ca588d08c8be',
  },
  {
    name: 'Sunset Sailing Cruise',
    category: 'cruise',
    description: 'A 2-hour sailing cruise during golden hour. Champagne, canapés, and breathtaking views of the city skyline from the water.',
    shortDesc: '2-hour sunset cruise with champagne.',
    priceAdult: 79,
    durationMins: 120,
    maxGroup: 20,
    rating: 4.9,
    reviewCount: 2108,
    tags: ['romantic', 'views', 'evening'],
    imageSlug: 'photo-1544551763-46a013bb70d5',
  },
  {
    name: 'Local Cooking Masterclass',
    category: 'class',
    description: 'Learn to cook three traditional local dishes from a professional chef. Market visit included. Take home the recipes. Groups of 6-8 maximum.',
    shortDesc: 'Half-day cooking class with market visit.',
    priceAdult: 110,
    durationMins: 300,
    maxGroup: 8,
    rating: 4.9,
    reviewCount: 643,
    tags: ['food', 'culture', 'interactive'],
    imageSlug: 'photo-1556909114-f6e7ad7d3136',
  },
  {
    name: 'Street Art & Graffiti Tour',
    category: 'cultural',
    description: 'Discover the city\'s vibrant street art scene with a local urban artist as your guide. Learn about the stories and politics behind the murals.',
    shortDesc: '2-hour urban art walking tour.',
    priceAdult: 28,
    durationMins: 120,
    maxGroup: 15,
    rating: 4.7,
    reviewCount: 1204,
    tags: ['art', 'photography', 'culture'],
    imageSlug: 'photo-1536924940846-227afb31e2a5',
  },
  {
    name: 'Night Photography Workshop',
    category: 'class',
    description: 'Master night photography with a professional photographer. Visit 5 iconic spots in 4 hours and come home with stunning long-exposure shots.',
    shortDesc: '4-hour night photography tour.',
    priceAdult: 95,
    durationMins: 240,
    maxGroup: 6,
    rating: 4.8,
    reviewCount: 387,
    tags: ['photography', 'night', 'art'],
    imageSlug: 'photo-1502920917128-1aa500764cbd',
  },
  {
    name: 'Day Trip to the Countryside',
    category: 'tour',
    description: 'Escape the city on a full-day tour to a stunning nearby village. Includes wine tasting at a local vineyard, a home-cooked lunch, and castle visit.',
    shortDesc: 'Full-day vineyard & village excursion.',
    priceAdult: 130,
    durationMins: 480,
    maxGroup: 16,
    rating: 4.8,
    reviewCount: 2891,
    tags: ['nature', 'wine', 'culture'],
    imageSlug: 'photo-1500076656116-558758c991c1',
  },
  {
    name: 'Historic Quarter Bike Tour',
    category: 'tour',
    description: 'Cycle through the city\'s most beautiful historic quarter on a comfortable e-bike. Covers twice the ground of a walking tour.',
    shortDesc: '3-hour e-bike tour of the historic quarter.',
    priceAdult: 45,
    durationMins: 180,
    maxGroup: 12,
    rating: 4.8,
    reviewCount: 1567,
    tags: ['cycling', 'history', 'active'],
    imageSlug: 'photo-1558618666-fcd25c85cd64',
  },
  {
    name: 'Spa & Wellness Half-Day',
    category: 'wellness',
    description: 'A 4-hour spa experience at the city\'s most celebrated wellness retreat. Includes hammam, massage, and rooftop relaxation pool.',
    shortDesc: '4-hour luxury spa experience.',
    priceAdult: 155,
    durationMins: 240,
    maxGroup: 4,
    rating: 4.9,
    reviewCount: 821,
    tags: ['relaxation', 'wellness', 'luxury'],
    imageSlug: 'photo-1540555700478-4be289fbecef',
  },
  {
    name: 'Live Jazz & Dinner Evening',
    category: 'entertainment',
    description: 'An intimate evening of live jazz in a 1920s underground club. 3-course dinner, craft cocktails, and the best musicians in the city.',
    shortDesc: '3-hour jazz dinner experience.',
    priceAdult: 95,
    durationMins: 180,
    maxGroup: 30,
    rating: 4.8,
    reviewCount: 1092,
    tags: ['nightlife', 'music', 'food'],
    imageSlug: 'photo-1514525253161-7a46d19cd819',
  },
];

export class MockActivityProvider extends BaseProvider {
  async search(params: ActivitySearchParams): Promise<ProviderResponse<ActivityOffer[]>> {
    await this.randomDelay(500, 1000);

    const numResults = Math.min(params.maxResults ?? 12, ACTIVITY_TEMPLATES.length);

    const offers: ActivityOffer[] = ACTIVITY_TEMPLATES.slice(0, numResults).map((tpl, i) => {
      const childPrice = Math.round(tpl.priceAdult * 0.6);
      const totalForGroup = tpl.priceAdult * params.adults + childPrice * (params.children ?? 0);

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const availDays = days.map((_, idx) => idx).filter(d => d !== 0); // No Sundays

      return {
        id: `activity_${this.id()}`,
        provider: 'mock',
        name: tpl.name,
        category: tpl.category,
        description: tpl.description,
        shortDescription: tpl.shortDesc,
        highlights: tpl.tags.map(t => `${t.charAt(0).toUpperCase() + t.slice(1)} focused`),
        images: [
          { url: `https://images.unsplash.com/${tpl.imageSlug}?w=800`, alt: tpl.name },
        ],
        price: {
          adult: tpl.priceAdult,
          child: childPrice,
          currency: 'USD',
          totalForGroup,
          includesTax: true,
        },
        duration: {
          minutes: tpl.durationMins,
          label: tpl.durationMins >= 480 ? 'Full day' : tpl.durationMins >= 240 ? 'Half day' : `${Math.round(tpl.durationMins / 60)} hours`,
          flexible: false,
        },
        groupSize: {
          max: tpl.maxGroup,
          private: tpl.maxGroup <= 6,
          label: tpl.maxGroup <= 6 ? `Private (max ${tpl.maxGroup})` : `Small group (max ${tpl.maxGroup})`,
        },
        location: {
          name: `${params.destination} City Centre`,
          address: `Meeting point: ${i + 1}0 Main Square, ${params.destination}`,
          meetingPoint: 'Main entrance — look for the Aria flag',
        },
        schedule: {
          daysOfWeek: availDays,
          startTimes: ['09:00', '14:00'],
          nextAvailable: params.startDate,
        },
        inclusions: ['Professional guide', 'All equipment', ...(tpl.category === 'food_drink' ? ['All tastings', 'Welcome drink'] : [])],
        exclusions: ['Gratuities', 'Personal purchases'],
        cancellationPolicy: {
          type: 'free',
          freeCancellationUntil: params.startDate,
          description: 'Free cancellation up to 24 hours before the activity',
        },
        rating: {
          score: tpl.rating,
          reviewCount: tpl.reviewCount,
          label: tpl.rating >= 4.9 ? 'Outstanding' : tpl.rating >= 4.7 ? 'Excellent' : 'Very Good',
        },
        languages: ['English', 'Spanish', 'French'],
        itineraryDayId: params.itineraryDayId,
        itineraryDayDate: params.startDate,
        ariaNote: `Highly recommended for ${tpl.tags[0]} lovers — consistently rated among the best in ${params.destination}.`,
        searchedAt: new Date().toISOString(),
      };
    });

    return this.wrap(offers, 'mock-activities');
  }
}

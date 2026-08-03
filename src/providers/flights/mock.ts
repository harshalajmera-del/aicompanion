// ─────────────────────────────────────────────────────────────────────────────
// Mock Flight Provider
// Returns realistic flight offers for any origin/destination pair.
// ─────────────────────────────────────────────────────────────────────────────

import { BaseProvider } from '../base';
import type { FlightSearchParams, FlightOffer, FlightSegment, Airline, FlightTime } from '@/types/flight';
import type { ProviderResponse } from '@/types/provider';

const AIRLINES: Airline[] = [
  { code: 'AA', name: 'American Airlines',  logoUrl: 'https://logo.clearbit.com/aa.com' },
  { code: 'UA', name: 'United Airlines',    logoUrl: 'https://logo.clearbit.com/united.com' },
  { code: 'DL', name: 'Delta Air Lines',    logoUrl: 'https://logo.clearbit.com/delta.com' },
  { code: 'BA', name: 'British Airways',    logoUrl: 'https://logo.clearbit.com/britishairways.com' },
  { code: 'AF', name: 'Air France',         logoUrl: 'https://logo.clearbit.com/airfrance.com' },
  { code: 'LH', name: 'Lufthansa',          logoUrl: 'https://logo.clearbit.com/lufthansa.com' },
  { code: 'EK', name: 'Emirates',           logoUrl: 'https://logo.clearbit.com/emirates.com' },
  { code: 'SQ', name: 'Singapore Airlines', logoUrl: 'https://logo.clearbit.com/singaporeair.com' },
  { code: 'QR', name: 'Qatar Airways',      logoUrl: 'https://logo.clearbit.com/qatarairways.com' },
  { code: 'NH', name: 'ANA',                logoUrl: 'https://logo.clearbit.com/ana.co.jp' },
];

// Approximate flight durations in minutes between major cities
const ROUTE_DURATIONS: Record<string, number> = {
  'JFK-CDG': 435, 'CDG-JFK': 510, 'JFK-NRT': 840, 'NRT-JFK': 780,
  'JFK-DPS': 960, 'LAX-CDG': 660, 'LAX-NRT': 720, 'LHR-CDG': 75,
  'LHR-NRT': 720, 'LHR-DPS': 840, 'SYD-NRT': 660, 'SIN-NRT': 390,
  'DXB-CDG': 390, 'DXB-NRT': 600, 'default': 480,
};

function getRouteDuration(origin: string, dest: string): number {
  return ROUTE_DURATIONS[`${origin}-${dest}`]
    ?? ROUTE_DURATIONS[`${dest}-${origin}`]
    ?? ROUTE_DURATIONS.default;
}

function buildTime(airportCode: string, dateStr: string, timeStr: string): FlightTime {
  return {
    airportCode,
    airportName: `${airportCode} International Airport`,
    cityName: airportCode,
    datetime: `${dateStr}T${timeStr}:00`,
    date: dateStr,
    time: timeStr,
  };
}

function buildSegment(
  airline: Airline,
  origin: string,
  destination: string,
  departDate: string,
  departTime: string,
  durationMins: number,
  flightNum: number,
): FlightSegment {
  // Calculate arrival time
  const [h, m] = departTime.split(':').map(Number);
  const arrivalMins = h * 60 + m + durationMins;
  const arrH = Math.floor((arrivalMins % 1440) / 60).toString().padStart(2, '0');
  const arrM = (arrivalMins % 60).toString().padStart(2, '0');
  const daysOver = Math.floor(arrivalMins / 1440);
  const arrDate = daysOver > 0
    ? new Date(new Date(departDate).getTime() + daysOver * 86400000).toISOString().split('T')[0]
    : departDate;

  return {
    id: `seg_${airline.code}${flightNum}`,
    flightNumber: `${airline.code}${flightNum}`,
    airline,
    departure: buildTime(origin, departDate, departTime),
    arrival: buildTime(destination, arrDate, `${arrH}:${arrM}`),
    duration: `PT${Math.floor(durationMins / 60)}H${durationMins % 60}M`,
    aircraft: 'Boeing 787',
    cabin: 'Economy',
  };
}

export class MockFlightProvider extends BaseProvider {
  async search(params: FlightSearchParams): Promise<ProviderResponse<FlightOffer[]>> {
    await this.randomDelay(600, 1200);

    const durationMins = getRouteDuration(params.origin, params.destination);
    const passengers = params.adults + (params.children ?? 0);

    const cabinMultiplier: Record<string, number> = {
      economy: 1, premium_economy: 2.2, business: 4.5, first: 8,
    };
    const mult = cabinMultiplier[params.cabinClass] ?? 1;
    const basePrice = Math.round((durationMins * 0.6 + 100) * mult);

    const departureTimes = ['06:30', '09:15', '12:00', '14:45', '18:00', '21:30'];
    const numResults = Math.min(params.maxResults ?? 6, 6);
    const offers: FlightOffer[] = [];

    for (let i = 0; i < numResults; i++) {
      const airline = AIRLINES[i % AIRLINES.length];
      const departTime = departureTimes[i % departureTimes.length];
      const isDirectFlight = i % 3 !== 2; // every 3rd is 1-stop
      const stopoverDuration = isDirectFlight ? 0 : this.randomBetween(60, 120);
      const totalDuration = durationMins + stopoverDuration;
      const priceVariance = 0.8 + (i * 0.1);
      const perPersonPrice = Math.round(basePrice * priceVariance);
      const totalPrice = perPersonPrice * passengers;
      const taxes = Math.round(totalPrice * 0.12);

      const outboundSegment = buildSegment(
        airline, params.origin, params.destination,
        params.departureDate, departTime, durationMins, 100 + i,
      );

      const outbound = {
        segments: [outboundSegment],
        totalDuration: `PT${Math.floor(totalDuration / 60)}H${totalDuration % 60}M`,
        totalDurationMinutes: totalDuration,
        stops: isDirectFlight ? 0 : 1,
        stopoverCities: isDirectFlight ? [] : ['LHR'],
      };

      let inbound = undefined;
      if (params.returnDate) {
        const retSeg = buildSegment(
          airline, params.destination, params.origin,
          params.returnDate, departTime, durationMins, 200 + i,
        );
        inbound = {
          segments: [retSeg],
          totalDuration: `PT${Math.floor(durationMins / 60)}H${durationMins % 60}M`,
          totalDurationMinutes: durationMins,
          stops: 0,
          stopoverCities: [],
        };
      }

      offers.push({
        id: `flight_${this.id()}`,
        provider: 'mock',
        origin: {
          airportCode: params.origin,
          airportName: `${params.origin} International`,
          cityName: params.origin,
          countryCode: 'US',
        },
        destination: {
          airportCode: params.destination,
          airportName: `${params.destination} International`,
          cityName: params.destination,
          countryCode: 'FR',
        },
        outbound,
        inbound,
        passengers,
        cabinClass: params.cabinClass,
        price: {
          total: totalPrice + taxes,
          base: totalPrice,
          taxes,
          fees: 25,
          currency: params.currency ?? 'USD',
          perPerson: perPersonPrice + Math.round(taxes / passengers),
        },
        baggage: {
          carryOn: { included: true, pieces: 1, weightKg: 10 },
          checked: {
            included: params.cabinClass !== 'economy' || i % 2 === 0,
            pieces: params.cabinClass !== 'economy' ? 2 : 1,
            weightKg: 23,
            fee: params.cabinClass === 'economy' && i % 2 !== 0 ? 45 : undefined,
          },
        },
        fareConditions: {
          refundable: i % 3 === 0,
          changeable: i % 2 === 0,
          refundFee: i % 3 === 0 ? 0 : 150,
          changeFee: i % 2 === 0 ? 75 : 200,
          currency: params.currency ?? 'USD',
          notes: i % 3 === 0 ? ['Fully refundable up to 24h before departure'] : ['Non-refundable fare'],
        },
        validatingCarrier: airline.code,
        searchedAt: new Date().toISOString(),
      });
    }

    // Sort by price ascending
    offers.sort((a, b) => a.price.total - b.price.total);
    return this.wrap(offers, 'mock-flights');
  }
}

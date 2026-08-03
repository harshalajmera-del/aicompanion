// ─────────────────────────────────────────────────────────────────────────────
// Flight Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FlightSearchParams {
  origin: string;                 // IATA code
  destination: string;            // IATA code
  departureDate: string;          // YYYY-MM-DD
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  cabinClass: import('./conversation').CabinClass;
  currency?: string;
  maxResults?: number;
}

export interface FlightOffer {
  id: string;
  provider: string;
  origin: FlightEndpoint;
  destination: FlightEndpoint;
  outbound: FlightLeg;
  inbound?: FlightLeg;            // null for one-way
  passengers: number;
  cabinClass: import('./conversation').CabinClass;
  price: PriceDetail;
  baggage: BaggagePolicy;
  fareConditions: FareConditions;
  validatingCarrier: string;
  bookingUrl?: string;
  deepLinkToken?: string;
  searchedAt: string;
}

export interface FlightEndpoint {
  airportCode: string;
  airportName: string;
  cityName: string;
  countryCode: string;
  terminal?: string;
}

export interface FlightLeg {
  segments: FlightSegment[];
  totalDuration: string;          // PTxHxM format
  totalDurationMinutes: number;
  stops: number;
  stopoverCities?: string[];
}

export interface FlightSegment {
  id: string;
  flightNumber: string;
  airline: Airline;
  departure: FlightTime;
  arrival: FlightTime;
  duration: string;
  aircraft?: string;
  operatedBy?: string;
  cabin?: string;
}

export interface Airline {
  code: string;
  name: string;
  logoUrl?: string;
}

export interface FlightTime {
  airportCode: string;
  airportName: string;
  cityName: string;
  terminal?: string;
  datetime: string;               // ISO datetime
  date: string;
  time: string;
}

export interface PriceDetail {
  total: number;
  base: number;
  taxes: number;
  fees: number;
  currency: string;
  perPerson: number;
  priceChange?: number;           // % change from yesterday
}

export interface BaggagePolicy {
  carryOn: BaggageAllowance;
  checked: BaggageAllowance;
}

export interface BaggageAllowance {
  included: boolean;
  pieces?: number;
  weightKg?: number;
  fee?: number;
  currency?: string;
}

export interface FareConditions {
  refundable: boolean;
  changeable: boolean;
  refundFee?: number;
  changeFee?: number;
  currency?: string;
  expiresAt?: string;
  notes?: string[];
}

export interface AirportInfo {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  coordinates: import('./destination').Coordinates;
  timezone: string;
}

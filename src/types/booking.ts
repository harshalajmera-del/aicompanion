// ─────────────────────────────────────────────────────────────────────────────
// Booking Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TripSummary {
  tripId: string;
  destination: string;
  originCity: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  travelers: import('./itinerary').TravelerCount;
  flight?: import('./flight').FlightOffer;
  hotel?: import('./hotel').HotelOffer;
  activities: import('./activity').ActivityOffer[];
  totalCost: TotalCostBreakdown;
  itinerary?: import('./itinerary').Itinerary;
  status: BookingStatus;
  bookings: BookingItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TotalCostBreakdown {
  flights: number;
  hotel: number;
  activities: number;
  estimatedFood: number;
  estimatedTransport: number;
  estimatedMisc: number;
  subtotal: number;
  taxes: number;
  total: number;
  currency: string;
  perPerson: number;
}

export interface BookingItem {
  id: string;
  type: 'flight' | 'hotel' | 'activity';
  status: BookingItemStatus;
  referenceNumber?: string;
  provider?: string;
  confirmationCode?: string;
  amount: number;
  currency: string;
  bookedAt?: string;
}

export type BookingStatus = 'planning' | 'partial' | 'confirmed' | 'cancelled';
export type BookingItemStatus = 'pending' | 'confirmed' | 'failed' | 'cancelled';

export interface CheckoutSession {
  sessionId: string;
  tripSummary: TripSummary;
  paymentMethod?: PaymentMethod;
  travelerDetails: TravelerDetails[];
  termsAccepted: boolean;
  createdAt: string;
}

export interface PaymentMethod {
  type: 'card' | 'paypal' | 'bank_transfer';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface TravelerDetails {
  type: 'adult' | 'child' | 'infant';
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
  email?: string;
  phone?: string;
}

export interface CurrencyConversionResult {
  from: string;
  to: string;
  amount: number;
  converted: number;
  rate: number;
  fetchedAt: string;
}

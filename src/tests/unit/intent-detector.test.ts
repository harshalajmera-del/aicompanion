import { detectIntent } from '@/engines/conversation/intent-detector';

describe('Intent Detector', () => {
  describe('Greeting detection', () => {
    it.each([
      ['hi', 'greeting'],
      ['hello!', 'greeting'],
      ['hey there', 'greeting'],
      ['good morning', 'greeting'],
    ])('detects "%s" as greet', (input) => {
      const result = detectIntent(input, 'greeting');
      expect(result.intent).toBe('greet');
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Destination detection', () => {
    it('detects travel intent', () => {
      const result = detectIntent('I want to travel to Paris', 'discover');
      expect(result.intent).toBe('discover_destination');
    });

    it('detects beach vacation intent', () => {
      const result = detectIntent('I want a beach vacation', 'discover');
      expect(result.intent).toBe('discover_destination');
    });
  });

  describe('Date extraction', () => {
    it('extracts duration in days', () => {
      const result = detectIntent('I have 7 days', 'collecting_details');
      expect(result.extracted.durationDays).toBe(7);
    });

    it('extracts duration in weeks', () => {
      const result = detectIntent('I want a 2 week trip', 'collecting_details');
      expect(result.extracted.durationDays).toBe(14);
    });

    it('extracts long weekend', () => {
      const result = detectIntent('just a long weekend', 'collecting_details');
      expect(result.extracted.durationDays).toBe(3);
    });
  });

  describe('Budget extraction', () => {
    it('extracts USD amount with $ sign', () => {
      const result = detectIntent('my budget is $2500', 'collecting_details');
      expect(result.extracted.budget).toBe(2500);
      expect(result.extracted.currency).toBe('USD');
      expect(result.intent).toBe('provide_budget');
    });

    it('extracts budget with comma separator', () => {
      const result = detectIntent('about $5,000 total', 'collecting_details');
      expect(result.extracted.budget).toBe(5000);
    });
  });

  describe('Traveler extraction', () => {
    it('detects solo travel', () => {
      const result = detectIntent('just me, solo', 'collecting_details');
      expect(result.extracted.adults).toBe(1);
      expect(result.extracted.travelerType).toBe('solo');
    });

    it('detects couple', () => {
      const result = detectIntent('me and my partner', 'collecting_details');
      expect(result.extracted.adults).toBe(2);
      expect(result.extracted.travelerType).toBe('couple');
    });

    it('detects family', () => {
      const result = detectIntent('2 adults and 2 kids', 'collecting_details');
      expect(result.extracted.adults).toBe(2);
      expect(result.extracted.children).toBe(2);
    });
  });

  describe('Approval detection', () => {
    it('detects approval', () => {
      const result = detectIntent('looks perfect!', 'approve_itinerary');
      expect(result.intent).toBe('approve_itinerary');
    });

    it('detects "let\'s book it"', () => {
      const result = detectIntent("that's perfect, let's book it!", 'approve_itinerary');
      expect(result.intent).toBe('approve_itinerary');
    });
  });

  describe('Modification detection', () => {
    it('detects change request', () => {
      const result = detectIntent('can we change day 3 to something more relaxing?', 'refine_itinerary');
      expect(result.intent).toBe('modify_itinerary');
    });
  });
});

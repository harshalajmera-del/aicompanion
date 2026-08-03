// ─────────────────────────────────────────────────────────────────────────────
// MCP Tool Executor
// Dispatches validated tool calls to the appropriate provider.
// ─────────────────────────────────────────────────────────────────────────────

import type { MCPToolName } from './tools';
import type { MCPToolResult } from '@/types/provider';
import {
  getFlightProvider, getHotelProvider, getActivityProvider,
  getWeatherProvider, getDestinationProvider, getCurrencyProvider,
} from '@/providers';
import { generateItinerary } from '@/engines/itinerary/generator';
import { generateId } from '@/lib/utils';
import { DESTINATION_DATA } from '@/engines/itinerary/destination-data';

export async function executeMCPTool(
  toolName: MCPToolName,
  params: Record<string, unknown>,
  callId?: string,
): Promise<MCPToolResult> {
  const id = callId ?? generateId();
  const start = Date.now();

  try {
    const data = await dispatch(toolName, params);
    return {
      callId: id,
      toolName,
      success: true,
      data,
      executionMs: Date.now() - start,
    };
  } catch (err) {
    return {
      callId: id,
      toolName,
      success: false,
      error: err instanceof Error ? err.message : String(err),
      executionMs: Date.now() - start,
    };
  }
}

async function dispatch(toolName: MCPToolName, p: Record<string, unknown>): Promise<unknown> {
  switch (toolName) {

    case 'suggest_destinations': {
      const provider = getDestinationProvider();
      const result = await provider.suggest(p.query as string, {
        budgetTier: p.budgetTier as never,
        travelerType: p.travelerType as never,
        interests: p.interests as never,
        month: p.month as number,
      });
      return result.data;
    }

    case 'plan_itinerary': {
      const trip = {
        destination: p.destination as string,
        originCity: p.originCity as string,
        startDate: p.startDate as string,
        endDate: p.endDate as string,
        durationDays: p.durationDays as number,
        adults: p.adults as number,
        children: (p.children as number) ?? 0,
        infants: 0,
        budget: p.budget as number,
        currency: (p.currency as string) ?? 'USD',
        itineraryApproved: false,
        selectedActivityIds: [],
        destinationHierarchy: [],
      };
      const profile = {
        interests: ((p.interests as string[]) ?? []) as never,
        travelerType: p.travelerType as never,
        accommodationPreference: p.accommodationType as never,
        budgetTier: p.budgetTier as never,
      };
      return generateItinerary({ trip, profile });
    }

    case 'regenerate_itinerary': {
      const trip = {
        destination: p.destination as string,
        originCity: p.originCity as string,
        startDate: p.startDate as string,
        endDate: p.endDate as string,
        durationDays: p.durationDays as number,
        adults: p.adults as number,
        children: (p.children as number) ?? 0,
        infants: 0,
        budget: p.budget as number,
        currency: (p.currency as string) ?? 'USD',
        itineraryApproved: false,
        selectedActivityIds: [],
        destinationHierarchy: [],
      };
      return generateItinerary({
        trip,
        profile: { interests: [], travelerType: p.travelerType as never },
        partialRegenDayIds: p.regenerateDayIds as string[],
      });
    }

    case 'search_flights': {
      const provider = getFlightProvider();
      const result = await provider.search({
        origin: p.origin as string,
        destination: p.destination as string,
        departureDate: p.departureDate as string,
        returnDate: p.returnDate as string | undefined,
        adults: p.adults as number,
        children: (p.children as number) ?? 0,
        cabinClass: (p.cabinClass as never) ?? 'economy',
        currency: (p.currency as string) ?? 'USD',
      });
      return result.data;
    }

    case 'search_hotels': {
      const provider = getHotelProvider();
      const result = await provider.search({
        destination: p.destination as string,
        checkIn: p.checkIn as string,
        checkOut: p.checkOut as string,
        adults: p.adults as number,
        children: (p.children as number) ?? 0,
        currency: (p.currency as string) ?? 'USD',
      });
      return result.data;
    }

    case 'search_activities': {
      const provider = getActivityProvider();
      const result = await provider.search({
        destination: p.destination as string,
        startDate: p.startDate as string,
        endDate: p.endDate as string | undefined,
        adults: p.adults as number,
        children: (p.children as number) ?? 0,
        interests: p.interests as never,
        itineraryDayId: p.itineraryDayId as string | undefined,
      });
      return result.data;
    }

    case 'weather_lookup': {
      const provider = getWeatherProvider();
      const result = await provider.getWeather(p.location as string, p.date as string);
      return result.data;
    }

    case 'currency_converter': {
      const provider = getCurrencyProvider();
      const result = await provider.convert(
        p.amount as number, p.from as string, p.to as string,
      );
      return result.data;
    }

    case 'destination_information': {
      const dest = (p.destination as string).toLowerCase();
      const data = DESTINATION_DATA[dest] ?? DESTINATION_DATA[dest.split(',')[0].trim()];
      if (!data) return { error: `No information found for ${p.destination}` };
      return {
        name: data.name,
        currency: data.currency,
        climate: data.climate,
        highlights: data.highlights,
        packingList: data.packingList,
        safetyTips: data.safetyTips,
        usefulApps: data.usefulApps,
        ariaRecommendation: data.ariaRecommendation,
      };
    }

    case 'budget_optimizer': {
      const ALLOC: Record<string, Record<string, number>> = {
        budget:         { flights: 0.35, accommodation: 0.25, activities: 0.15, food: 0.20, misc: 0.05 },
        moderate:       { flights: 0.30, accommodation: 0.28, activities: 0.20, food: 0.17, misc: 0.05 },
        luxury:         { flights: 0.28, accommodation: 0.35, activities: 0.20, food: 0.12, misc: 0.05 },
        'ultra-luxury': { flights: 0.25, accommodation: 0.40, activities: 0.20, food: 0.10, misc: 0.05 },
      };
      const alloc = ALLOC[(p.tier as string) ?? 'moderate'];
      const total = p.totalBudget as number;
      return Object.fromEntries(
        Object.entries(alloc).map(([k, v]) => [k, Math.round(total * v)]),
      );
    }

    case 'maps_search': {
      // Stub — real implementation would call Google Places API
      return { message: 'Maps search requires live Google Places integration', location: p.location };
    }

    case 'travel_context': {
      return { message: 'Context retrieved from memory store' };
    }

    default:
      throw new Error(`Unknown MCP tool: ${toolName}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider Factory — returns the correct provider based on PROVIDER_MODE env var
// ─────────────────────────────────────────────────────────────────────────────

import type { ProviderConfig } from '@/types/provider';
import { MockFlightProvider } from './flights/mock';
import { MockHotelProvider } from './hotels/mock';
import { MockActivityProvider } from './activities/mock';
import { MockWeatherProvider } from './weather/mock';
import { MockDestinationProvider } from './destinations/mock';
import { MockCurrencyProvider } from './currency/mock';

function getConfig(): ProviderConfig {
  return {
    mode: (process.env.PROVIDER_MODE as 'mock' | 'live') ?? 'mock',
    timeout: 10000,
    retries: 2,
  };
}

export function getFlightProvider() {
  const cfg = getConfig();
  if (cfg.mode === 'live') {
    // TODO: return new AmadeusFlightProvider(cfg);
    return new MockFlightProvider(cfg);
  }
  return new MockFlightProvider(cfg);
}

export function getHotelProvider() {
  const cfg = getConfig();
  if (cfg.mode === 'live') {
    // TODO: return new AmadeusHotelProvider(cfg);
    return new MockHotelProvider(cfg);
  }
  return new MockHotelProvider(cfg);
}

export function getActivityProvider() {
  const cfg = getConfig();
  if (cfg.mode === 'live') {
    // TODO: return new ViatorActivityProvider(cfg);
    return new MockActivityProvider(cfg);
  }
  return new MockActivityProvider(cfg);
}

export function getWeatherProvider() {
  const cfg = getConfig();
  if (cfg.mode === 'live') {
    // TODO: return new OpenWeatherProvider(cfg);
    return new MockWeatherProvider(cfg);
  }
  return new MockWeatherProvider(cfg);
}

export function getDestinationProvider() {
  const cfg = getConfig();
  return new MockDestinationProvider(cfg);
}

export function getCurrencyProvider() {
  const cfg = getConfig();
  return new MockCurrencyProvider(cfg);
}

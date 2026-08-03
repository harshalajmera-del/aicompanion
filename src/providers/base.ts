// ─────────────────────────────────────────────────────────────────────────────
// Provider Base — shared abstractions for all data providers
// ─────────────────────────────────────────────────────────────────────────────

import type { ProviderConfig, ProviderResponse } from '@/types/provider';
import { generateId } from '@/lib/utils';

export abstract class BaseProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  get mode() { return this.config.mode; }

  protected wrap<T>(data: T, providerName: string, latencyMs?: number): ProviderResponse<T> {
    return {
      data,
      provider: providerName,
      cached: false,
      fetchedAt: new Date().toISOString(),
      latencyMs,
    };
  }

  protected randomDelay(min = 300, max = 900): Promise<void> {
    const ms = Math.floor(Math.random() * (max - min)) + min;
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  protected pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  protected id(): string { return generateId(); }
}

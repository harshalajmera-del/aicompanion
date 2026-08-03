// Mock Currency Provider
import { BaseProvider } from '../base';
import type { CurrencyConversionResult } from '@/types/booking';
import type { ProviderResponse } from '@/types/provider';

// Fixed exchange rates vs USD (representative, not live)
const RATES_TO_USD: Record<string, number> = {
  USD: 1, EUR: 1.09, GBP: 1.27, JPY: 0.0067, AUD: 0.65, CAD: 0.74,
  CHF: 1.12, INR: 0.012, AED: 0.27, SGD: 0.75, IDR: 0.000065,
  THB: 0.028, MYR: 0.22, MXN: 0.058, BRL: 0.20,
};

export class MockCurrencyProvider extends BaseProvider {
  async convert(
    amount: number, from: string, to: string,
  ): Promise<ProviderResponse<CurrencyConversionResult>> {
    await this.randomDelay(50, 150);
    const fromRate = RATES_TO_USD[from] ?? 1;
    const toRate = RATES_TO_USD[to] ?? 1;
    const rate = fromRate / toRate;
    return this.wrap({
      from, to, amount,
      converted: Math.round(amount * rate * 100) / 100,
      rate,
      fetchedAt: new Date().toISOString(),
    }, 'mock-currency');
  }
}

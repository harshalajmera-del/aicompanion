// ─────────────────────────────────────────────────────────────────────────────
// Mock Weather Provider
// Returns realistic seasonal weather data for any location.
// ─────────────────────────────────────────────────────────────────────────────

import { BaseProvider } from '../base';
import type { WeatherData, WeatherForecastDay, CurrentWeather } from '@/types/weather';
import type { ProviderResponse } from '@/types/provider';
import type { WeatherCondition } from '@/types/itinerary';
import { addDaysToDate } from '@/lib/utils';

const CONDITIONS: WeatherCondition[] = [
  'sunny', 'partly_cloudy', 'cloudy', 'light_rain', 'rain', 'overcast',
];

const CONDITION_DESCRIPTIONS: Record<WeatherCondition, string> = {
  sunny: 'Clear skies and bright sunshine',
  partly_cloudy: 'Mostly sunny with some clouds',
  cloudy: 'Overcast with no rain expected',
  overcast: 'Heavy cloud cover, grey skies',
  light_rain: 'Light showers, mostly intermittent',
  rain: 'Steady rainfall throughout the day',
  heavy_rain: 'Heavy persistent rain',
  thunderstorm: 'Thunderstorms with lightning',
  snow: 'Snowfall expected',
  fog: 'Dense fog, visibility reduced',
  windy: 'Gusty winds with clear skies',
};

const ICONS: Record<WeatherCondition, string> = {
  sunny: '01d', partly_cloudy: '02d', cloudy: '03d', overcast: '04d',
  light_rain: '09d', rain: '10d', heavy_rain: '09d', thunderstorm: '11d',
  snow: '13d', fog: '50d', windy: '50d',
};

function getSeasonalTemp(month: number, lat = 48.8): { high: number; low: number } {
  // Northern hemisphere seasonal model
  const isNorth = lat >= 0;
  const summerMos = isNorth ? [5, 6, 7, 8] : [11, 0, 1, 2];
  const winterMos = isNorth ? [11, 0, 1, 2] : [5, 6, 7, 8];
  if (summerMos.includes(month)) return { high: 26 + Math.random() * 8, low: 16 + Math.random() * 5 };
  if (winterMos.includes(month)) return { high: 8 + Math.random() * 6, low: 2 + Math.random() * 4 };
  return { high: 17 + Math.random() * 6, low: 10 + Math.random() * 5 };
}

function pickCondition(month: number): WeatherCondition {
  const summer = month >= 5 && month <= 8;
  const weights = summer
    ? [40, 25, 15, 10, 5, 5]    // mostly sunny in summer
    : [15, 20, 25, 20, 15, 5];  // more clouds/rain in off-season
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (let i = 0; i < CONDITIONS.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) return CONDITIONS[i];
  }
  return 'partly_cloudy';
}

export class MockWeatherProvider extends BaseProvider {
  async getWeather(location: string, date?: string): Promise<ProviderResponse<WeatherData>> {
    await this.randomDelay(200, 500);

    const startDate = date ?? new Date().toISOString().split('T')[0];
    const month = new Date(startDate).getMonth();
    const temps = getSeasonalTemp(month);
    const condition = pickCondition(month);

    const current: CurrentWeather = {
      condition,
      tempC: Math.round((temps.high + temps.low) / 2),
      tempF: Math.round(((temps.high + temps.low) / 2) * 9 / 5 + 32),
      feelsLikeC: Math.round((temps.high + temps.low) / 2 - 2),
      humidity: condition.includes('rain') ? 82 : 58,
      windKph: this.randomBetween(8, 28),
      windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][this.randomBetween(0, 7)],
      visibilityKm: condition === 'fog' ? 0.5 : 10,
      uvIndex: this.randomBetween(1, 8),
      precipitation: condition.includes('rain') ? this.randomBetween(2, 15) : 0,
      description: CONDITION_DESCRIPTIONS[condition],
      icon: ICONS[condition],
      isDay: true,
    };

    const forecast: WeatherForecastDay[] = Array.from({ length: 10 }, (_, i) => {
      const dayDate = addDaysToDate(startDate, i);
      const dayMonth = new Date(dayDate).getMonth();
      const dayTemps = getSeasonalTemp(dayMonth);
      const dayCondition = pickCondition(dayMonth);
      const isRainy = dayCondition.includes('rain');

      return {
        date: dayDate,
        condition: dayCondition,
        tempHighC: Math.round(dayTemps.high),
        tempLowC: Math.round(dayTemps.low),
        tempHighF: Math.round(dayTemps.high * 9 / 5 + 32),
        tempLowF: Math.round(dayTemps.low * 9 / 5 + 32),
        feelsLikeC: Math.round(dayTemps.low + (dayTemps.high - dayTemps.low) * 0.4),
        precipitation: isRainy ? this.randomBetween(2, 20) : 0,
        precipitationChance: isRainy ? this.randomBetween(50, 90) : this.randomBetween(5, 25),
        humidity: isRainy ? this.randomBetween(70, 90) : this.randomBetween(45, 65),
        windKph: this.randomBetween(8, 32),
        uvIndex: this.randomBetween(1, 8),
        description: CONDITION_DESCRIPTIONS[dayCondition],
        icon: ICONS[dayCondition],
        sunrise: '06:45',
        sunset: month >= 4 && month <= 8 ? '21:15' : '17:30',
      };
    });

    return this.wrap({
      location,
      coordinates: { lat: 48.8566, lng: 2.3522 },
      current,
      forecast,
      timezone: 'Europe/Paris',
      fetchedAt: new Date().toISOString(),
    }, 'mock-weather');
  }
}

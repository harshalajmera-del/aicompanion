// ─────────────────────────────────────────────────────────────────────────────
// Weather Types
// ─────────────────────────────────────────────────────────────────────────────

import type { WeatherCondition } from './itinerary';
import type { CSSProperties } from 'react';

export interface WeatherData {
  location: string;
  coordinates: import('./destination').Coordinates;
  current: CurrentWeather;
  forecast: WeatherForecastDay[];
  timezone: string;
  fetchedAt: string;
}

export interface CurrentWeather {
  condition: WeatherCondition;
  tempC: number;
  tempF: number;
  feelsLikeC: number;
  humidity: number;
  windKph: number;
  windDirection: string;
  visibilityKm: number;
  uvIndex: number;
  precipitation: number;
  description: string;
  icon: string;
  isDay: boolean;
}

export interface WeatherForecastDay {
  date: string;
  condition: WeatherCondition;
  tempHighC: number;
  tempLowC: number;
  tempHighF: number;
  tempLowF: number;
  feelsLikeC: number;
  precipitation: number;
  precipitationChance: number;
  humidity: number;
  windKph: number;
  uvIndex: number;
  description: string;
  icon: string;
  sunrise: string;
  sunset: string;
  hourly?: HourlyWeather[];
}

export interface HourlyWeather {
  time: string;
  tempC: number;
  condition: WeatherCondition;
  precipitationChance: number;
  windKph: number;
  icon: string;
}

export interface WeatherEffect {
  condition: WeatherCondition;
  cssClass: string;
  backgroundStyle: CSSProperties;
  particleCount?: number;
  showLightning?: boolean;
  ambientSound?: string;
}

// Re-export WeatherCondition for convenience
export type { WeatherCondition };

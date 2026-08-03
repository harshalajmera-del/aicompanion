'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import type { WeatherCondition } from '@/types/itinerary';

interface WeatherOverlayProps {
  condition: WeatherCondition;
  children: React.ReactNode;
  className?: string;
}

const WEATHER_CLASSES: Partial<Record<WeatherCondition, string>> = {
  sunny:          'weather-sunny',
  partly_cloudy:  'weather-partly_cloudy',
  cloudy:         'weather-cloudy',
  overcast:       'weather-cloudy',
  light_rain:     'weather-rain',
  rain:           'weather-rain',
  heavy_rain:     'weather-rain',
  thunderstorm:   'weather-storm',
  snow:           'weather-snow',
};

export function WeatherOverlay({ condition, children, className }: WeatherOverlayProps) {
  const weatherClass = WEATHER_CLASSES[condition] ?? '';
  return (
    <div className={cn('relative', weatherClass, className)}>
      {condition === 'thunderstorm' && <LightningEffect />}
      {(condition === 'rain' || condition === 'heavy_rain' || condition === 'light_rain') && <RainParticles intensity={condition === 'heavy_rain' ? 'heavy' : 'light'} />}
      {condition === 'snow' && <SnowParticles />}
      {children}
    </div>
  );
}

function RainParticles({ intensity }: { intensity: 'light' | 'heavy' }) {
  const count = intensity === 'heavy' ? 30 : 15;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 w-px bg-blue-300/40 animate-rain-fall"
          style={{
            left: `${(i / count) * 100}%`,
            height: `${20 + Math.random() * 30}px`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${0.4 + Math.random() * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

function SnowParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full opacity-80 animate-snow-fall"
          style={{
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 6}s`,
          }}
        />
      ))}
    </div>
  );
}

function LightningEffect() {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const flash = () => {
      setVisible(true);
      setTimeout(() => setVisible(false), 150);
    };
    const interval = setInterval(flash, 4000 + Math.random() * 6000);
    return () => clearInterval(interval);
  }, []);
  return visible ? (
    <div className="absolute inset-0 bg-white/30 pointer-events-none z-10 transition-opacity duration-75" />
  ) : null;
}

// Compact weather badge for headers
export function WeatherBadge({ condition, tempHigh, tempLow }: {
  condition: WeatherCondition; tempHigh: number; tempLow: number;
}) {
  const icons: Partial<Record<WeatherCondition, string>> = {
    sunny: '☀️', partly_cloudy: '⛅', cloudy: '☁️', overcast: '🌥️',
    light_rain: '🌦️', rain: '🌧️', heavy_rain: '⛈️', thunderstorm: '⛈️',
    snow: '❄️', fog: '🌫️', windy: '💨',
  };
  return (
    <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 text-sm backdrop-blur-sm">
      <span>{icons[condition] ?? '🌤️'}</span>
      <span className="font-semibold">{tempHigh}°</span>
      <span className="opacity-70">/ {tempLow}°C</span>
    </div>
  );
}

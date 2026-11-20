import { useEffect, useState } from 'react';
import type { PhilippineCity } from '../types/kalinga';

export interface WeatherTelemetry {
  temperatureC: number;
  windKmh: number;
  humidity: number;
  precipitationMm: number;
  conditionLabel: string;
  severity: 'normal' | 'caution' | 'alert';
  fetchedAt: string;
  isCached: boolean;
}

function interpretWmoCode(code: number): { label: string; severity: 'normal' | 'caution' | 'alert' } {
  if (code === 0) return { label: 'Clear Sky', severity: 'normal' };
  if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', severity: 'normal' };
  if (code === 45 || code === 48) return { label: 'Haze / Fog', severity: 'normal' };
  if (code >= 51 && code <= 67) return { label: 'Rain & Showers', severity: 'caution' };
  if (code >= 80 && code <= 82) return { label: 'Heavy Rain Showers', severity: 'caution' };
  if (code >= 95) return { label: 'Thunderstorm Activity', severity: 'alert' };
  return { label: 'Variable Weather', severity: 'normal' };
}

export function useWeatherAdvisory(city: PhilippineCity | undefined, isOnline: boolean) {
  const [weather, setWeather] = useState<WeatherTelemetry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city) return;
    const cacheKey = `kalinga_weather_${city.id}`;
    let cancelled = false;

    const loadCached = (): WeatherTelemetry | null => {
      try {
        const raw = window.localStorage.getItem(cacheKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as WeatherTelemetry;
        return { ...parsed, isCached: true };
      } catch {
        return null;
      }
    };

    const cached = loadCached();
    if (cached) {
      setWeather(cached);
    }

    if (!isOnline) {
      setLoading(false);
      if (!cached) {
        setError('Offline mode active. Live weather updates resume when connected.');
      }
      return;
    }

    setLoading(true);
    setError(null);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FManila`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Weather feed unavailable');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const cur = data?.current;
        if (!cur) throw new Error('Incomplete meteorological telemetry');
        const interpreted = interpretWmoCode(Number(cur.weather_code ?? 0));
        const windKmh = Math.round(Number(cur.wind_speed_10m ?? 0));
        const precip = Number(cur.precipitation ?? 0);
        const severity =
          windKmh >= 55 || precip >= 15
            ? 'alert'
            : windKmh >= 35 || precip >= 5
              ? 'caution'
              : interpreted.severity;

        const next: WeatherTelemetry = {
          temperatureC: Math.round(Number(cur.temperature_2m ?? 28)),
          windKmh,
          humidity: Math.round(Number(cur.relative_humidity_2m ?? 70)),
          precipitationMm: Math.round(precip * 10) / 10,
          conditionLabel: interpreted.label,
          severity,
          fetchedAt: new Date().toLocaleTimeString('en-PH', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isCached: false,
        };
        setWeather(next);
        try {
          window.localStorage.setItem(cacheKey, JSON.stringify(next));
        } catch {
          // ignore
        }
      })
      .catch(() => {
        if (cancelled) return;
        if (!cached) {
          setError('Weather service temporarily unreachable. Refer to official PAGASA bulletins.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [city, isOnline]);

  return { weather, loading, error };
}

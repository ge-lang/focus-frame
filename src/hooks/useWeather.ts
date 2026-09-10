'use client';
import { useCallback, useEffect, useState } from 'react';

interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  city: string;
  country: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  sunrise: number;
  sunset: number;
  cloudiness: number;
  uvIndex: number;
  dewPoint: number;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
}

interface ForecastItem {
  dt: number;
  temp: number;
  icon: string;
  description: string;
}

export interface LocationSuggestion {
  name: string;
  state: string | null;
  country: string;
  lat: number;
  lon: number;
}

interface UseWeatherReturn {
  weather: WeatherData;
  forecast: ForecastItem[];
  setCity: (city: string) => void;
  setLocation: (city: string, countryCode?: string) => void;
  city: string;
  refresh: () => void;
  isLoading: boolean;
  isDemo: boolean;
}

const weatherCache = new Map<string, { weather: WeatherData; forecast: ForecastItem[]; timestamp: number; isDemo: boolean }>();

function generateDemoData(city: string, countryCode?: string): WeatherData {
  const now = Date.now();
  const baseTemp = 15 + Math.sin(now / 10_000_000) * 10;
  const hour = new Date().getHours();
  return {
    temp: Math.round(baseTemp), feelsLike: Math.round(baseTemp - 1), description: 'demo weather', icon: hour > 6 && hour < 20 ? '01d' : '01n',
    city, country: countryCode || 'Demo', humidity: 58, windSpeed: 3.2, windDirection: 180, pressure: 1015, visibility: 10_000,
    sunrise: Math.floor((now - 3_600_000) / 1000), sunset: Math.floor((now + 3_600_000) / 1000), cloudiness: 20, uvIndex: 3,
    dewPoint: Math.round(baseTemp - 5), loading: false, error: null, lastUpdated: now,
  };
}

function generateDemoForecast(): ForecastItem[] {
  return Array.from({ length: 5 }, (_, index) => ({
    dt: Math.floor(Date.now() / 1000) + index * 10_800,
    temp: Math.round(15 + Math.sin(index) * 5), icon: index % 2 === 0 ? '01d' : '02d', description: index % 3 === 0 ? 'clear sky' : 'few clouds',
  }));
}

function generateEmptyWeather(): WeatherData {
  return {
    temp: 0, feelsLike: 0, description: 'Choose a location', icon: '01d', city: '', country: '', humidity: 0,
    windSpeed: 0, windDirection: 0, pressure: 0, visibility: 0, sunrise: 0, sunset: 0, cloudiness: 0, uvIndex: 0,
    dewPoint: 0, loading: false, error: null, lastUpdated: 0,
  };
}

export function useWeather(initialCity = '', initialCountryCode?: string): UseWeatherReturn {
  const [city, setCity] = useState(initialCity);
  const [countryCode, setCountryCode] = useState<string | undefined>(initialCountryCode?.toUpperCase());
  const [weather, setWeather] = useState<WeatherData>(initialCity ? { ...generateDemoData(initialCity), loading: true } : generateEmptyWeather());
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(initialCity));
  const [isDemo, setIsDemo] = useState(false);

  const fetchWeatherData = useCallback(async (forceRefresh = false) => {
    if (!city.trim()) {
      setWeather(generateEmptyWeather());
      setForecast([]);
      setIsDemo(false);
      setIsLoading(false);
      return;
    }

    const cacheKey = `${city.toLowerCase()}_${countryCode ?? ''}`;
    const cached = weatherCache.get(cacheKey);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
      setWeather(cached.weather);
      setForecast(cached.forecast);
      setIsDemo(cached.isDemo);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setWeather((previous) => ({ ...previous, loading: true, error: null }));
    try {
      const params = new URLSearchParams({ city });
      if (countryCode) params.set('country', countryCode);
      const response = await fetch(`/api/weather?${params}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error ?? 'Weather service is temporarily unavailable');
      }
      const data = await response.json() as { weather: WeatherData; forecast: ForecastItem[] };
      weatherCache.set(cacheKey, { weather: data.weather, forecast: data.forecast, timestamp: Date.now(), isDemo: false });
      setWeather(data.weather);
      setForecast(data.forecast);
      setIsDemo(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Weather service is temporarily unavailable';
      setWeather({ ...generateDemoData(city, countryCode), error: `${message}. Showing demo data instead.` });
      setForecast(generateDemoForecast());
      setIsDemo(true);
    } finally {
      setIsLoading(false);
    }
  }, [city, countryCode]);

  useEffect(() => { void fetchWeatherData(); }, [fetchWeatherData]);
  useEffect(() => {
    const interval = window.setInterval(() => void fetchWeatherData(), 15 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [fetchWeatherData]);

  return {
    weather,
    forecast,
    setCity: (newCity) => { if (newCity.trim()) { setCity(newCity.trim()); setCountryCode(undefined); } },
    setLocation: (newCity, newCountryCode) => { if (newCity.trim()) { setCity(newCity.trim()); setCountryCode(newCountryCode?.toUpperCase()); } },
    city,
    refresh: () => { void fetchWeatherData(true); },
    isLoading,
    isDemo,
  };
}

export function useWeatherSearch(query: string, countryCode?: string) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const search = query.trim();
    if (search.length < 2) { setSuggestions([]); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams({ search });
        if (countryCode) params.set('country', countryCode);
        const response = await fetch(`/api/weather?${params}`, { signal: controller.signal });
        setSuggestions(response.ok ? await response.json() as LocationSuggestion[] : []);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, countryCode]);

  return { suggestions, isSearching };
}

export const getWindDirection = (degrees: number) => ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'][Math.round(degrees / 22.5) % 16];

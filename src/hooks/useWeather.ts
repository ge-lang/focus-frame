'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { normalizeWeatherCondition, isWeatherDay, type WeatherCondition } from '@/lib/weather-condition';

export interface WeatherLocation {
  name: string;
  state?: string | null;
  country: string;
  lat?: number;
  lon?: number;
  timezone?: number;
}

export interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  condition: WeatherCondition;
  conditionCode: number | null;
  isDay: boolean;
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
  location: WeatherLocation | null;
}

export interface ForecastItem {
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

interface WeatherSnapshot {
  location: WeatherLocation | null;
  weather: WeatherData;
  forecast: ForecastItem[];
  isLoading: boolean;
  isDemo: boolean;
}

interface CachedWeather {
  weather: WeatherData;
  forecast: ForecastItem[];
  timestamp: number;
}

const LOCATION_STORAGE_KEY = 'focus-frame-weather-location';
const weatherCache = new Map<string, CachedWeather>();
const listeners = new Set<() => void>();
const emptyWeather: WeatherData = {
  temp: 0,
  feelsLike: 0,
  description: 'Choose a location',
  icon: '01d',
  condition: 'clear',
  conditionCode: 800,
  isDay: true,
  city: '',
  country: '',
  humidity: 0,
  windSpeed: 0,
  windDirection: 0,
  pressure: 0,
  visibility: 0,
  sunrise: 0,
  sunset: 0,
  cloudiness: 0,
  uvIndex: 0,
  dewPoint: 0,
  loading: false,
  error: null,
  lastUpdated: 0,
  location: null,
};

let snapshot: WeatherSnapshot = {
  location: null,
  weather: emptyWeather,
  forecast: [],
  isLoading: false,
  isDemo: false,
};
let initialized = false;
let requestSequence = 0;
let activeRequest: AbortController | null = null;
let refreshTimerStarted = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function updateSnapshot(next: Partial<WeatherSnapshot>) {
  snapshot = { ...snapshot, ...next };
  notify();
}

function normalizedLocation(location: WeatherLocation): WeatherLocation {
  return {
    ...location,
    name: location.name.trim(),
    country: location.country.trim().toUpperCase(),
  };
}

export function getWeatherLocationKey(location: Pick<WeatherLocation, 'name' | 'country' | 'lat' | 'lon'>): string {
  if (typeof location.lat === 'number' && typeof location.lon === 'number') return `${location.lat.toFixed(4)}:${location.lon.toFixed(4)}`;
  return `${location.name.trim().toLowerCase()}_${location.country.trim().toUpperCase()}`;
}

export function restoreWeatherLocation(raw: string | null): WeatherLocation | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<WeatherLocation> & { city?: string };
    const name = typeof value.name === 'string' ? value.name : value.city;
    if (!name || typeof value.country !== 'string') return null;
    return normalizedLocation({
      name,
      state: typeof value.state === 'string' ? value.state : null,
      country: value.country,
      lat: typeof value.lat === 'number' ? value.lat : undefined,
      lon: typeof value.lon === 'number' ? value.lon : undefined,
      timezone: typeof value.timezone === 'number' ? value.timezone : undefined,
    });
  } catch {
    return raw.trim() ? { name: raw.trim(), country: '' } : null;
  }
}

function persistLocation(location: WeatherLocation) {
  try {
    window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  } catch {
    // Storage can be unavailable in private browsing; the live store still works.
  }
}

function readStoredLocation() {
  try {
    return restoreWeatherLocation(window.localStorage.getItem(LOCATION_STORAGE_KEY));
  } catch {
    return null;
  }
}

function demoWeather(location: WeatherLocation, error: string | null = null): WeatherData {
  const now = Date.now();
  const baseTemp = 15 + Math.sin(now / 10_000_000) * 10;
  const isDay = new Date().getHours() > 6 && new Date().getHours() < 20;
  const icon = isDay ? '01d' : '01n';
  return {
    ...emptyWeather,
    temp: Math.round(baseTemp),
    feelsLike: Math.round(baseTemp - 1),
    description: 'demo weather',
    icon,
    condition: 'clear',
    conditionCode: 800,
    isDay,
    city: location.name,
    country: location.country || 'Demo',
    humidity: 58,
    windSpeed: 3.2,
    windDirection: 180,
    pressure: 1015,
    visibility: 10_000,
    sunrise: Math.floor((now - 3_600_000) / 1000),
    sunset: Math.floor((now + 3_600_000) / 1000),
    cloudiness: 20,
    uvIndex: 3,
    dewPoint: Math.round(baseTemp - 5),
    loading: false,
    error,
    lastUpdated: now,
    location,
  };
}

function demoForecast(): ForecastItem[] {
  return Array.from({ length: 5 }, (_, index) => ({
    dt: Math.floor(Date.now() / 1000) + index * 10_800,
    temp: Math.round(15 + Math.sin(index) * 5),
    icon: index % 2 === 0 ? '01d' : '02d',
    description: index % 3 === 0 ? 'clear sky' : 'few clouds',
  }));
}

function weatherFromResponse(data: { weather: WeatherData }, fallbackLocation: WeatherLocation): WeatherData {
  const incoming = data.weather;
  const icon = typeof incoming.icon === 'string' ? incoming.icon : '01d';
  const conditionCode = typeof incoming.conditionCode === 'number' ? incoming.conditionCode : null;
  return {
    ...incoming,
    icon,
    conditionCode,
    condition: incoming.condition ?? normalizeWeatherCondition(conditionCode, icon),
    isDay: typeof incoming.isDay === 'boolean' ? incoming.isDay : isWeatherDay(icon),
    location: incoming.location ?? fallbackLocation,
    loading: false,
    error: null,
  };
}

async function loadWeather(location: WeatherLocation, forceRefresh = false) {
  const sequence = ++requestSequence;
  activeRequest?.abort();
  const controller = new AbortController();
  activeRequest = controller;
  const cacheKey = getWeatherLocationKey(location);
  const cached = weatherCache.get(cacheKey);

  if (!forceRefresh && cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
    if (sequence !== requestSequence) return;
    updateSnapshot({ weather: cached.weather, forecast: cached.forecast, isLoading: false, isDemo: false });
    return;
  }

  updateSnapshot({
    weather: { ...snapshot.weather, ...emptyWeather, city: location.name, country: location.country, location, loading: true, error: null },
    forecast: [],
    isLoading: true,
    isDemo: false,
  });

  try {
    const params = new URLSearchParams({ city: location.name });
    if (location.country) params.set('country', location.country);
    if (typeof location.lat === 'number') params.set('lat', String(location.lat));
    if (typeof location.lon === 'number') params.set('lon', String(location.lon));
    const response = await fetch(`/api/weather?${params}`, { signal: controller.signal });
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      throw new Error(payload?.error ?? 'Weather service is temporarily unavailable');
    }
    const data = await response.json() as { weather: WeatherData; forecast: ForecastItem[] };
    if (sequence !== requestSequence) return;
    const weather = weatherFromResponse(data, location);
    weatherCache.set(cacheKey, { weather, forecast: data.forecast, timestamp: Date.now() });
    updateSnapshot({ location: weather.location, weather, forecast: data.forecast, isLoading: false, isDemo: false });
  } catch (error) {
    if (controller.signal.aborted || sequence !== requestSequence) return;
    const message = error instanceof Error ? error.message : 'Weather service is temporarily unavailable';
    updateSnapshot({ weather: demoWeather(location, `${message}. Showing demo data instead.`), forecast: demoForecast(), isLoading: false, isDemo: true });
  } finally {
    if (sequence === requestSequence) activeRequest = null;
  }
}

function ensureInitialized(initialCity: string, initialCountryCode?: string) {
  if (initialized) return;
  initialized = true;
  const storedLocation = readStoredLocation();
  const fallbackLocation = initialCity.trim() ? normalizedLocation({ name: initialCity, country: initialCountryCode ?? '' }) : null;
  const location = storedLocation ?? fallbackLocation;
  if (location) {
    updateSnapshot({
      location,
      weather: { ...emptyWeather, city: location.name, country: location.country, location, loading: true },
      isLoading: true,
    });
    void loadWeather(location);
  }
  if (!refreshTimerStarted) {
    refreshTimerStarted = true;
    window.setInterval(() => {
      if (snapshot.location && !snapshot.isLoading) void loadWeather(snapshot.location);
    }, 15 * 60 * 1000);
  }
}

export interface UseWeatherReturn {
  weather: WeatherData;
  forecast: ForecastItem[];
  selectedLocation: WeatherLocation | null;
  setCity: (city: string) => void;
  setLocation: (location: WeatherLocation | string, countryCode?: string) => void;
  city: string;
  refresh: () => void;
  isLoading: boolean;
  isDemo: boolean;
}

export function useWeather(initialCity = '', initialCountryCode?: string): UseWeatherReturn {
  const current = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshot,
    () => snapshot,
  );

  useEffect(() => {
    ensureInitialized(initialCity, initialCountryCode);
    return () => undefined;
  }, [initialCity, initialCountryCode]);

  const selectLocation = useCallback((nextLocation: WeatherLocation) => {
    const location = normalizedLocation(nextLocation);
    if (!location.name) return;
    persistLocation(location);
    updateSnapshot({ location });
    void loadWeather(location);
  }, []);

  const setCity = useCallback((city: string) => {
    if (city.trim()) selectLocation({ name: city.trim(), country: '' });
  }, [selectLocation]);

  const setLocation = useCallback((location: WeatherLocation | string, countryCode?: string) => {
    if (typeof location === 'string') {
      if (location.trim()) selectLocation({ name: location.trim(), country: countryCode ?? '' });
      return;
    }
    selectLocation(location);
  }, [selectLocation]);

  const refresh = useCallback(() => {
    if (snapshot.location) void loadWeather(snapshot.location, true);
  }, []);

  return {
    weather: current.weather,
    forecast: current.forecast,
    selectedLocation: current.location,
    setCity,
    setLocation,
    city: current.location?.name ?? '',
    refresh,
    isLoading: current.isLoading,
    isDemo: current.isDemo,
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

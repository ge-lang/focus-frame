// src/components/widgets/weather-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';
import { ModalPortal } from '@/components/modal-portal';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeather, useWeatherSearch, type WeatherLocation } from '@/hooks/useWeather';
import { countries } from '@/lib/countries';
import { findCountryForCity, getPopularCitiesForCountry, getWeatherDisplayName, resolveCountrySelection } from '@/lib/weather-location';
import { WeatherArtScene } from '@/components/weather-art-scene';
import { DayArc, UvGauge, WindCompass } from '@/components/weather-instruments';
import { calculateMoonPhase, formatMoonPhase, getTargetLocationDate } from '@/lib/weather-visual';
import { useEffect, useRef, useState } from 'react';
import { useDashboard } from '@/contexts/dashboard-context';
import { 
  MapPin, 
  Settings, 
  Eye, 
  Wind, 
  Gauge,
  Droplets,
} from 'lucide-react';

interface WeatherWidgetProps {
  widgetId: string;
  initialCity?: string;
  initialCountryCode?: string;
  title?: string;
  onContentHeightChange?: (widgetId: string, height: number) => void;
}

export default function WeatherWidget({ 
  widgetId,
  initialCity = '',
  initialCountryCode,
  title,
  onContentHeightChange,
}: WeatherWidgetProps) {
  const { updateWidgetConfig } = useDashboard();
  const { weather, selectedLocation, setLocation, isDemo } = useWeather(initialCity, initialCountryCode);
  const [isEditing, setIsEditing] = useState(false);
  const [inputCity, setInputCity] = useState(initialCity);
  const [countryCode, setCountryCode] = useState(initialCountryCode ?? findCountryForCity(initialCity) ?? '');
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const contentRef = useRef<HTMLDivElement>(null);
  const { suggestions, isSearching } = useWeatherSearch(isEditing ? inputCity : '', countryCode || undefined);
  const popularCities = getPopularCitiesForCountry(countryCode);

  useEffect(() => {
    if (!isEditing && selectedLocation) {
      setInputCity(selectedLocation.name);
      setCountryCode(selectedLocation.country);
    }
  }, [isEditing, selectedLocation]);

  useEffect(() => {
    const element = contentRef.current;
    if (!element || !onContentHeightChange || typeof ResizeObserver === 'undefined') return;

    const reportHeight = () => onContentHeightChange(widgetId, element.scrollHeight);
    const observer = new ResizeObserver(reportHeight);
    observer.observe(element);
    const frame = window.requestAnimationFrame(reportHeight);
    const settleTimer = window.setTimeout(reportHeight, 350);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
    };
  }, [isEditing, onContentHeightChange, weather.city, weather.loading, widgetId]);

  // Temperature conversion
  const displayTemp = unit === 'celsius' ? weather.temp : Math.round((weather.temp * 9/5) + 32);
  const displayFeelsLike = unit === 'celsius' ? weather.feelsLike : Math.round((weather.feelsLike * 9/5) + 32);
  const targetWeatherDate = getTargetLocationDate(new Date(), weather.location?.timezone ?? 0);
  const uvIndex = Math.min(Math.max(weather.uvIndex, 0), 11);
  const uvLabel = uvIndex < 3 ? 'Low' : uvIndex < 6 ? 'Moderate' : uvIndex < 8 ? 'High' : uvIndex < 11 ? 'Very High' : 'Extreme';
  const displayCity = getWeatherDisplayName(weather.city);
  const displayCountry = weather.country && weather.country !== 'Demo'
    ? countries.find((country) => country.code === weather.country)?.name ?? weather.country
    : '';

  const handleCityChange = (newCity: string, selectedCountry = countryCode, selectedLocation?: WeatherLocation) => {
    setLocation(selectedLocation ?? { name: newCity, country: selectedCountry || '' });
    updateWidgetConfig(widgetId, { city: newCity, country: selectedCountry || '' });
    setCountryCode(selectedCountry);
    setIsEditing(false);
    setInputCity(newCity);
  };

  const handleCountryChange = (nextCountry: string) => {
    setCountryCode(nextCountry);
    setInputCity(nextCountry ? resolveCountrySelection(nextCountry, inputCity) : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCity.trim()) {
      handleCityChange(inputCity.trim());
    }
  };

  const resetLocationForm = () => {
    setInputCity(weather.city || initialCity);
    if (countries.some((country) => country.code === weather.country)) setCountryCode(weather.country);
    setIsEditing(false);
  };

  const toggleUnit = () => {
    setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius');
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  if (weather.loading) {
    return (
      <AnimatedWidget contentRef={contentRef} dataWidgetId={widgetId}>
        <div className="h-full flex flex-col justify-center">
          <div className="text-center">
            <h3 className="widget-drag-handle flex cursor-grab select-none items-center justify-center font-semibold text-lg mb-4 text-gray-800 active:cursor-grabbing">
              <MapPin size={16} className="mr-2" />
              {title || 'Weather'}
            </h3>
            <div className="animate-pulse space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-slate-100"></div>
              <div className="mx-auto h-8 w-24 rounded bg-slate-100"></div>
              <div className="mx-auto h-4 w-32 rounded bg-slate-100"></div>
              <div className="mx-auto h-3 w-20 rounded bg-slate-100"></div>
            </div>
          </div>
        </div>
      </AnimatedWidget>
    );
  }

  if (!weather.city && !isEditing) {
    return (
      <AnimatedWidget contentRef={contentRef} dataWidgetId={widgetId}>
        <div className="flex min-h-40 flex-col items-center justify-center text-center">
          <MapPin size={22} className="mb-2 text-indigo-600" />
          <h3 className="widget-drag-handle cursor-grab select-none font-semibold text-slate-900 active:cursor-grabbing">{title || 'Weather'}</h3>
          <p className="mt-1 text-sm text-slate-500">Choose a location to see local weather.</p>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="mt-4 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Choose location
          </button>
        </div>
      </AnimatedWidget>
    );
  }

  return (
    <AnimatedWidget contentRef={contentRef} dataWidgetId={widgetId} className="ff-weather-widget h-full">
      <div className="ff-weather-full">
        <header className="ff-weather-header">
          <div className="ff-weather-location-group">
            <MapPin className="ff-weather-location-icon" size={24} aria-hidden="true" />
            <div className="ff-weather-location-copy">
              <div className="ff-weather-title-row">
                <h3 className="widget-drag-handle cursor-grab select-none active:cursor-grabbing">{title || 'Weather'}</h3>
                {isDemo && <span className="ff-weather-demo-badge">Demo</span>}
              </div>
              <button type="button" onClick={() => setIsEditing(true)} className="ff-weather-location-button">
                {displayCity}{displayCountry ? `, ${displayCountry}` : ''}
              </button>
            </div>
          </div>

          <div className="ff-weather-controls">
            <button
              type="button"
              onClick={toggleUnit}
              aria-label={`Switch to degrees ${unit === 'celsius' ? 'Fahrenheit' : 'Celsius'}`}
              className="ff-weather-unit-control"
            >
              °{unit === 'celsius' ? 'C' : 'F'}
            </button>
            <button
              type="button"
              aria-label="Change weather location"
              onClick={() => setIsEditing(true)}
              className="ff-weather-settings-control"
              title="Change city"
            >
              <Settings size={21} />
            </button>
          </div>
        </header>

        {/* City editing mode */}
        <AnimatePresence>
          {isEditing && (
            <ModalPortal>
              <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ff-modal-backdrop fixed inset-0 flex items-start justify-center overflow-y-auto overscroll-contain p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[max(4rem,10vh)]"
              onClick={resetLocationForm}
            >
              <form onSubmit={handleSubmit} data-no-drag onClick={(event) => event.stopPropagation()} className="ff-modal-panel w-full max-w-md max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                <label className="block text-xs font-medium text-gray-700">
                  Country
                  <select
                    value={countryCode}
                    onChange={(event) => handleCountryChange(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Any country</option>
                    {countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
                  </select>
                </label>

                {popularCities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5" aria-label="Popular cities">
                    {popularCities.map((cityOption) => (
                      <button
                        key={cityOption}
                        type="button"
                        onClick={() => setInputCity(cityOption)}
                        className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${inputCity === cityOption ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                      >
                        {cityOption}
                      </button>
                    ))}
                  </div>
                )}

                <label className="block text-xs font-medium text-gray-700">
                  City
                  <input
                    type="text"
                    value={inputCity}
                    onChange={(e) => setInputCity(e.target.value)}
                    placeholder="Choose or enter a city"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </label>
                {isSearching && <p className="text-xs text-gray-500">Searching cities…</p>}
                {suggestions.length > 0 && (
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                    {suggestions.map((location) => (
                      <button
                        key={`${location.name}-${location.state}-${location.country}-${location.lat}`}
                        type="button"
                        onClick={() => handleCityChange(location.name, location.country, location)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-indigo-50"
                      >
                        <span>{location.name}{location.state ? `, ${location.state}` : ''}</span>
                        <span className="ml-3 text-xs text-gray-500">{location.country}{location.state ? ` · ${location.state}` : ''}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white transition-colors hover:bg-indigo-700"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={resetLocationForm}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>

              </form>
              </motion.div>
            </ModalPortal>
          )}
        </AnimatePresence>

        {!isEditing && (
          <main className="ff-weather-composition">
            <WeatherArtScene
              condition={weather.condition}
              isDay={weather.isDay}
              icon={weather.icon}
              conditionCode={weather.conditionCode}
              date={targetWeatherDate}
              variant="full"
              className="ff-weather-hero-layout"
              visualClassName="ff-weather-hero-visual"
              ariaLabel="Current conditions"
            >
              <div className="ff-weather-reading">
                <div className="ff-weather-temperature">
                  {displayTemp}°{unit === 'celsius' ? 'C' : 'F'}
                </div>
                <div className="ff-weather-reading-city">{displayCity}</div>
                <div className="ff-weather-condition">{weather.description}</div>
                <div className="ff-weather-feels-like">Feels like {displayFeelsLike}°</div>
                {!weather.isDay && (weather.condition === 'clear' || weather.condition === 'partlyCloudy') ? <div className="ff-weather-moon-caption">{formatMoonPhase(calculateMoonPhase(targetWeatherDate))}</div> : null}
              </div>
            </WeatherArtScene>

            <section className="ff-weather-primary-row" aria-label="Humidity and wind">
              <div className="ff-weather-primary-reading">
                <Droplets size={32} aria-hidden="true" />
                <div>
                  <strong>{weather.humidity}%</strong>
                  <span>Humidity</span>
                </div>
              </div>
              <div className="ff-weather-primary-reading">
                <Wind size={34} aria-hidden="true" />
                <div>
                  <strong>{weather.windSpeed} m/s</strong>
                  <span>Wind</span>
                </div>
              </div>
            </section>

            <section className="ff-weather-secondary-row" aria-label="Weather details">
              <div className="ff-weather-secondary-reading">
                <Gauge size={22} aria-hidden="true" />
                <strong>{weather.pressure} hPa</strong>
                <span>Pressure</span>
              </div>
              <div className="ff-weather-secondary-reading">
                <Eye size={23} aria-hidden="true" />
                <strong>{weather.visibility / 1000} km</strong>
                <span>Visibility</span>
              </div>
              <div className="ff-weather-secondary-reading ff-weather-wind-direction">
                <WindCompass degrees={weather.windDirection} />
                <strong>{getWindDirection(weather.windDirection)} · {Math.round(weather.windDirection)}°</strong>
                <span>Wind direction</span>
              </div>
              <div className="ff-weather-secondary-reading ff-weather-uv-reading">
                <UvGauge value={uvIndex} />
                <strong>{uvIndex}</strong>
                <span>{uvLabel} · UV Index</span>
              </div>
            </section>

            {weather.sunrise > 0 && weather.sunset > 0 ? (
              <section className="ff-weather-day-section" aria-label="Sunrise and sunset">
                <DayArc sunrise={weather.sunrise} sunset={weather.sunset} timezoneOffsetSeconds={weather.location?.timezone ?? 0} />
              </section>
            ) : null}
          </main>
        )}

        {weather.error && (
          <div className="ff-weather-error" role="status">
            {weather.error}
          </div>
        )}
      </div>
    </AnimatedWidget>
  );
}

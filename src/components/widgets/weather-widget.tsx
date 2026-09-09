// src/components/widgets/weather-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';
import { ModalPortal } from '@/components/modal-portal';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeather, useWeatherSearch } from '@/hooks/useWeather';
import { countries } from '@/lib/countries';
import { findCountryForCity, getPopularCitiesForCountry, resolveCountrySelection } from '@/lib/weather-location';
import { WeatherIcon } from '@/components/weather-icon';
import { useEffect, useState } from 'react';
import { 
  MapPin, 
  Settings, 
  RefreshCw, 
  Sunrise, 
  Sunset, 
  Eye, 
  Wind, 
  Gauge,
  Thermometer,
  Droplets,
  Compass
} from 'lucide-react';

interface WeatherWidgetProps {
  widgetId: string;
  initialCity?: string;
  title?: string;
}

export default function WeatherWidget({ 
  initialCity = '',
  title 
}: WeatherWidgetProps) {
  const { weather, setLocation, refresh, isDemo } = useWeather(initialCity);
  const [isEditing, setIsEditing] = useState(false);
  const [inputCity, setInputCity] = useState(initialCity);
  const [countryCode, setCountryCode] = useState(findCountryForCity(initialCity) ?? '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const { suggestions, isSearching } = useWeatherSearch(isEditing ? inputCity : '', countryCode || undefined);
  const popularCities = getPopularCitiesForCountry(countryCode);

  useEffect(() => {
    if (!isEditing) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isEditing]);

  // Temperature conversion
  const displayTemp = unit === 'celsius' ? weather.temp : Math.round((weather.temp * 9/5) + 32);
  const displayFeelsLike = unit === 'celsius' ? weather.feelsLike : Math.round((weather.feelsLike * 9/5) + 32);

  const handleCityChange = (newCity: string, selectedCountry = countryCode) => {
    setLocation(newCity, selectedCountry || undefined);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refresh();
    window.setTimeout(() => setIsRefreshing(false), 400);
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

  const getUVIndex = (temp: number) => {
    // Simple UV index simulation based on temperature.
    const baseUV = Math.min(Math.max(Math.floor(temp / 10), 1), 11);
    return baseUV;
  };

  if (weather.loading) {
    return (
      <AnimatedWidget>
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
      <AnimatedWidget>
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
    <AnimatedWidget className="h-full">
      <div className="h-full flex flex-col">
        {/* Header and controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <MapPin size={18} className="text-gray-600 mr-2" />
            <h3 className="widget-drag-handle cursor-grab select-none font-semibold text-lg text-gray-800 active:cursor-grabbing">
              {title || 'Weather'}
            </h3>
            {isDemo && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">Demo</span>}
          </div>
          
          <div className="flex space-x-1">
            <button
              aria-label="Refresh weather"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button
              aria-label="Change weather location"
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
              title="Change city"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

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
                        onClick={() => handleCityChange(location.name, location.country)}
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

        {/* Main weather information */}
        {!isEditing && (
          <div className="flex-1">
            {/* City and unit switcher */}
            <div className="flex justify-between items-center mb-4">
              <div 
                onClick={() => setIsEditing(true)}
                className="flex items-center cursor-pointer group"
              >
                <MapPin size={14} className="text-gray-600 mr-1" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  {weather.city}{weather.country && weather.country !== 'Demo' ? `, ${countries.find((country) => country.code === weather.country)?.name ?? weather.country}` : ''}
                </span>
              </div>
              
              <button
                onClick={toggleUnit}
                aria-label={`Switch to degrees ${unit === 'celsius' ? 'Fahrenheit' : 'Celsius'}`}
                className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 transition-colors hover:bg-slate-50"
              >
                °{unit === 'celsius' ? 'C' : 'F'}
              </button>
            </div>

            {/* Primary metrics */}
            <div className="text-center mb-6">
              <WeatherIcon icon={weather.icon} className="text-6xl mb-2 mx-auto" />
              
              <div className="text-5xl font-bold text-gray-800 mb-1">
                {displayTemp}°{unit === 'celsius' ? 'C' : 'F'}
              </div>
              
              <div className="text-lg font-medium text-gray-700 mb-2 capitalize">
                {weather.description}
              </div>
              
              <div className="text-sm text-gray-600">
                Feels like {displayFeelsLike}°
              </div>
            </div>

            {/* Quick metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                <Droplets size={16} className="mx-auto mb-1 text-indigo-600" />
                <div className="text-sm font-medium">{weather.humidity}%</div>
                <div className="text-xs text-gray-600">Humidity</div>
              </div>
              
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                <Wind size={16} className="mx-auto mb-1 text-indigo-600" />
                <div className="text-sm font-medium">{weather.windSpeed} m/s</div>
                <div className="text-xs text-gray-600">Wind</div>
              </div>
            </div>

            {/* Details button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mb-4 w-full rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>

            {/* Detailed information */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Pressure</span>
                        <Gauge size={12} className="text-indigo-600" />
                      </div>
                      <div className="text-sm font-medium">{weather.pressure} hPa</div>
                    </div>
                    
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Visibility</span>
                        <Eye size={12} className="text-indigo-600" />
                      </div>
                      <div className="text-sm font-medium">{weather.visibility / 1000} km</div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Wind Direction</span>
                      <Compass size={12} className="text-indigo-600" />
                    </div>
                    <div className="text-sm font-medium">
                      {getWindDirection(weather.windDirection)} ({weather.windDirection}°)
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">UV Index</span>
                      <Thermometer size={12} className="text-amber-600" />
                    </div>
                    <div className="text-sm font-medium">
                      {getUVIndex(weather.temp)} - {
                        getUVIndex(weather.temp) < 3 ? 'Low' :
                        getUVIndex(weather.temp) < 6 ? 'Moderate' :
                        getUVIndex(weather.temp) < 8 ? 'High' : 'Very High'
                      }
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Error status */}
        {weather.error && (
          <div className="mt-2 rounded-lg border border-sky-200 bg-sky-50 p-2 text-center text-xs text-sky-700">
            ℹ️ {weather.error}
          </div>
        )}
      </div>
    </AnimatedWidget>
  );
}

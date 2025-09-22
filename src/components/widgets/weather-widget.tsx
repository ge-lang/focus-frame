// src/components/widgets/weather-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';
import { motion } from 'framer-motion';
import { useWeather } from '@/hooks/useWeather';
import { WeatherIcon } from '@/components/weather-icon';
import { useState } from 'react';

interface WeatherWidgetProps {
  widgetId: string;
  initialCity?: string;
  title?: string;
}

const popularCities = [
  'Amsterdam', 'London', 'Paris', 'Berlin', 'Moscow',
  'New York', 'Tokyo', 'Sydney', 'Rome', 'Krasnoyarsk', 'Achinsk', 'Brussel', 'Bredene', 'Ostende',
   'Lichtervelde', 'Antwerpen', 'Yalta', 'Sevastopol'
];

export default function WeatherWidget({ 
  widgetId, 
  initialCity = 'Amsterdam',
  title 
}: WeatherWidgetProps) {
  const { weather, setCity, city: currentCity } = useWeather(initialCity);
  const [isEditing, setIsEditing] = useState(false);
  const [inputCity, setInputCity] = useState(currentCity);

  const gradient = weather.temp ? getTemperatureGradient(weather.temp) : 'from-gray-50 to-gray-100';

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    setIsEditing(false);
    setInputCity(newCity);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCity.trim()) {
      handleCityChange(inputCity.trim());
    }
  };

  if (weather.loading) {
    return (
      <AnimatedWidget className={`bg-gradient-to-br ${gradient}`}>
        <div className="text-center">
          <h3 className="font-semibold text-lg mb-4 text-gray-800">
            {title || 'Weather'}
          </h3>
          <div className="animate-pulse">
            <div className="h-12 w-12 bg-white/30 rounded-full mx-auto mb-3"></div>
            <div className="h-8 bg-white/30 rounded w-20 mx-auto mb-2"></div>
            <div className="h-4 bg-white/30 rounded w-28 mx-auto"></div>
          </div>
        </div>
      </AnimatedWidget>
    );
  }

  return (
    <AnimatedWidget className={`bg-gradient-to-br ${gradient}`}>
      <div className="text-center relative">
        
        <h3 className="font-semibold text-lg mb-4 text-gray-800">
          {title || 'Weather'}
        </h3>
        
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4"
          >
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="text"
                value={inputCity}
                onChange={(e) => setInputCity(e.target.value)}
                placeholder="Enter city name..."
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="w-full px-2 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
              >
                Apply
              </button>
            </form>

            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">Popular cities:</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {popularCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCityChange(city)}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            <WeatherIcon icon={weather.icon} className="mb-3" />
            
            <div className="text-4xl font-bold text-gray-800 mb-1">
              {weather.temp}°C
            </div>
            
            <div className="text-sm font-medium text-gray-700 mb-3 capitalize">
              {weather.description}
            </div>
            
            <div className="text-xs text-gray-600 mb-4 font-semibold cursor-pointer hover:text-gray-800 transition-colors">
              <span onClick={() => setIsEditing(true)}>🌍 {weather.city}</span>
            </div>

            <div className="flex justify-center space-x-4 text-xs text-gray-600">
              <div className="bg-white/30 rounded-full px-3 py-1">
                💧 {weather.humidity}%
              </div>
              <div className="bg-white/30 rounded-full px-3 py-1">
                💨 {weather.windSpeed} m/s
              </div>
            </div>

            {weather.error && (
              <div className="text-red-500 text-xs mt-2">
                {weather.error}
              </div>
            )}
          </>
        )}
      </div>
    </AnimatedWidget>
  );
}

// Функция для получения градиента по температуре
const getTemperatureGradient = (temp: number) => {
  if (temp < 0) return 'from-blue-100 to-blue-300';
  if (temp < 10) return 'from-blue-50 to-cyan-100';
  if (temp < 20) return 'from-green-50 to-emerald-100';
  if (temp < 30) return 'from-yellow-50 to-orange-100';
  return 'from-red-100 to-orange-300';
};
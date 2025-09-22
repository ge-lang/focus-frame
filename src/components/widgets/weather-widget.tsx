// src/components/widgets/weather-widget.tsx
'use client';
import { AnimatedWidget } from '@/components/animated-widget';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeather } from '@/hooks/useWeather';
import { WeatherIcon } from '@/components/weather-icon';
import { useState } from 'react';
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

const popularCities = [
  'Amsterdam', 'London', 'Paris', 'Berlin', 'Moscow',
  'New York', 'Tokyo', 'Sydney', 'Rome', 'Krasnoyarsk', 
  'Achinsk', 'Brussel', 'Bredene', 'Ostende', 'Lichtervelde', 
  'Antwerpen', 'Yalta', 'Sevastopol', 'Madrid', 'Istanbul'
];

// Расширяем хук useWeather для получения дополнительных данных
// Нужно обновить хук useWeather чтобы он возвращал больше данных
interface ExtendedWeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  city: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  sunrise?: number;
  sunset?: number;
  loading: boolean;
  error: string | null;
}

export default function WeatherWidget({ 
  widgetId, 
  initialCity = 'Amsterdam',
  title 
}: WeatherWidgetProps) {
  const { weather, setCity, city: currentCity } = useWeather(initialCity);
  const [isEditing, setIsEditing] = useState(false);
  const [inputCity, setInputCity] = useState(currentCity);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');

  // Конвертация температуры
  const displayTemp = unit === 'celsius' ? weather.temp : Math.round((weather.temp * 9/5) + 32);
  const displayFeelsLike = unit === 'celsius' ? weather.feelsLike : Math.round((weather.feelsLike * 9/5) + 32);

  const gradient = weather.temp ? getTemperatureGradient(weather.temp) : 'from-blue-50 to-cyan-100';

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Здесь можно добавить принудительное обновление данных
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const toggleUnit = () => {
    setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius');
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  const getUVIndex = (temp: number, time: number) => {
    // Простая имитация UV индекса на основе температуры и времени
    const baseUV = Math.min(Math.max(Math.floor(temp / 10), 1), 11);
    return baseUV;
  };

  if (weather.loading) {
    return (
      <AnimatedWidget className={`bg-gradient-to-br ${gradient}`}>
        <div className="h-full flex flex-col justify-center">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-4 text-gray-800 flex items-center justify-center">
              <MapPin size={16} className="mr-2" />
              {title || 'Weather'}
            </h3>
            <div className="animate-pulse space-y-4">
              <div className="h-16 w-16 bg-white/30 rounded-full mx-auto"></div>
              <div className="h-8 bg-white/30 rounded w-24 mx-auto"></div>
              <div className="h-4 bg-white/30 rounded w-32 mx-auto"></div>
              <div className="h-3 bg-white/30 rounded w-20 mx-auto"></div>
            </div>
          </div>
        </div>
      </AnimatedWidget>
    );
  }

  return (
    <AnimatedWidget className={`bg-gradient-to-br ${gradient} h-full`}>
      <div className="h-full flex flex-col">
        {/* Заголовок и управление */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <MapPin size={18} className="text-gray-600 mr-2" />
            <h3 className="font-semibold text-lg text-gray-800">
              {title || 'Weather'}
            </h3>
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
              title="Change city"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Режим редактирования города */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-white/30 rounded-lg">
                <input
                  type="text"
                  value={inputCity}
                  onChange={(e) => setInputCity(e.target.value)}
                  placeholder="Enter city name..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <p className="text-xs text-gray-600 mb-2">Popular cities:</p>
                  <div className="flex flex-wrap gap-1">
                    {popularCities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleCityChange(city)}
                        className="px-2 py-1 text-xs bg-white/50 text-gray-700 rounded hover:bg-white transition-colors"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Основная погодная информация */}
        {!isEditing && (
          <div className="flex-1">
            {/* Город и переключение единиц */}
            <div className="flex justify-between items-center mb-4">
              <div 
                onClick={() => setIsEditing(true)}
                className="flex items-center cursor-pointer group"
              >
                <MapPin size={14} className="text-gray-600 mr-1" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  {weather.city}
                </span>
              </div>
              
              <button
                onClick={toggleUnit}
                className="px-2 py-1 bg-white/50 text-gray-700 rounded-full text-xs hover:bg-white transition-colors"
              >
                °{unit === 'celsius' ? 'C' : 'F'}
              </button>
            </div>

            {/* Основные показатели */}
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

            {/* Быстрые метрики */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/30 rounded-lg p-3 text-center">
                <Droplets size={16} className="mx-auto mb-1 text-blue-500" />
                <div className="text-sm font-medium">{weather.humidity}%</div>
                <div className="text-xs text-gray-600">Humidity</div>
              </div>
              
              <div className="bg-white/30 rounded-lg p-3 text-center">
                <Wind size={16} className="mx-auto mb-1 text-green-500" />
                <div className="text-sm font-medium">{weather.windSpeed} m/s</div>
                <div className="text-xs text-gray-600">Wind</div>
              </div>
            </div>

            {/* Кнопка деталей */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full py-2 bg-white/50 rounded-lg hover:bg-white transition-colors text-sm font-medium mb-4"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>

            {/* Детальная информация */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Pressure</span>
                        <Gauge size={12} className="text-purple-500" />
                      </div>
                      <div className="text-sm font-medium">{weather.pressure} hPa</div>
                    </div>
                    
                    <div className="bg-white/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Visibility</span>
                        <Eye size={12} className="text-blue-500" />
                      </div>
                      <div className="text-sm font-medium">{weather.visibility / 1000} km</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Wind Direction</span>
                      <Compass size={12} className="text-green-500" />
                    </div>
                    <div className="text-sm font-medium">
                      {getWindDirection(weather.windDirection)} ({weather.windDirection}°)
                    </div>
                  </div>

                  <div className="bg-white/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">UV Index</span>
                      <Thermometer size={12} className="text-orange-500" />
                    </div>
                    <div className="text-sm font-medium">
                      {getUVIndex(weather.temp, Date.now())} - {
                        getUVIndex(weather.temp, Date.now()) < 3 ? 'Low' :
                        getUVIndex(weather.temp, Date.now()) < 6 ? 'Moderate' :
                        getUVIndex(weather.temp, Date.now()) < 8 ? 'High' : 'Very High'
                      }
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Статус ошибки */}
        {weather.error && (
          <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-xs text-center">
            ⚠️ {weather.error}
          </div>
        )}
      </div>
    </AnimatedWidget>
  );
}

// Функция для получения градиента по температуре
const getTemperatureGradient = (temp: number) => {
  if (temp < -10) return 'from-blue-200 to-indigo-300';      // Очень холодно
  if (temp < 0) return 'from-blue-100 to-blue-300';         // Холодно
  if (temp < 10) return 'from-blue-50 to-cyan-100';         // Прохладно
  if (temp < 20) return 'from-green-50 to-emerald-100';     // Умеренно
  if (temp < 30) return 'from-yellow-50 to-orange-100';     // Тепло
  if (temp < 35) return 'from-orange-100 to-red-200';       // Жарко
  return 'from-red-200 to-pink-300';                        // Очень жарко
};
// src/hooks/useWeather.ts
'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

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

interface UseWeatherReturn {
  weather: WeatherData;
  forecast: ForecastItem[];
  setCity: (city: string) => void;
  city: string;
  refresh: () => void;
  isLoading: boolean;
  isDemo: boolean;
}

// Кэш для хранения данных погоды
const weatherCache = new Map();

export function useWeather(initialCity: string = 'Amsterdam'): UseWeatherReturn {
  const [city, setCity] = useState(initialCity);
  const [weather, setWeather] = useState<WeatherData>({
    temp: 0,
    feelsLike: 0,
    description: '',
    icon: '',
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
    loading: true,
    error: null,
    lastUpdated: 0,
  });
  
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);

  // Генерация демо-данных с реалистичными значениями
  const generateDemoData = useCallback((currentCity: string) => {
    const now = Date.now();
    const baseTemp = 15 + Math.sin(now / 10000000) * 10; // Колебания температуры
    const hour = new Date().getHours();
    const isDay = hour > 6 && hour < 20;
    
    return {
      temp: Math.round(baseTemp),
      feelsLike: Math.round(baseTemp - 1),
      description: ['clear sky', 'few clouds', 'scattered clouds', 'broken clouds', 'shower rain', 'rain', 'thunderstorm', 'snow', 'mist'][Math.floor(Math.random() * 9)],
      icon: isDay ? '01d' : '01n',
      city: currentCity,
      country: 'Demo',
      humidity: 40 + Math.floor(Math.random() * 40),
      windSpeed: Math.round((Math.random() * 10 + 1) * 10) / 10,
      windDirection: Math.floor(Math.random() * 360),
      pressure: 1000 + Math.floor(Math.random() * 30),
      visibility: 10000,
      sunrise: Math.floor((now - 3600000) / 1000), // 1 час назад
      sunset: Math.floor((now + 3600000) / 1000),  // через 1 час
      cloudiness: Math.floor(Math.random() * 100),
      uvIndex: Math.floor(Math.random() * 11),
      dewPoint: Math.round(baseTemp - 5 - Math.random() * 5),
      loading: false,
      error: null,
      lastUpdated: now,
    };
  }, []);

  // Генерация демо-прогноза
  const generateDemoForecast = useCallback(() => {
    const forecastItems: ForecastItem[] = [];
    const baseTemp = 15;
    
    for (let i = 0; i < 5; i++) {
      forecastItems.push({
        dt: Date.now() / 1000 + i * 3 * 3600, // Каждые 3 часа
        temp: Math.round(baseTemp + Math.sin(i) * 5),
        icon: i % 2 === 0 ? '01d' : '02d',
        description: i % 3 === 0 ? 'clear sky' : 'few clouds',
      });
    }
    
    return forecastItems;
  }, []);

  const fetchWeatherData = useCallback(async (cityName: string, forceRefresh: boolean = false) => {
    const cacheKey = `weather_${cityName.toLowerCase()}`;
    const now = Date.now();
    
    // Проверяем кэш (актуальность 10 минут)
    if (!forceRefresh && weatherCache.has(cacheKey)) {
      const cached = weatherCache.get(cacheKey);
      if (now - cached.timestamp < 10 * 60 * 1000) {
        setWeather(cached.weather);
        setForecast(cached.forecast || []);
        setIsDemo(cached.isDemo);
        setIsLoading(false);
        return;
      }
    }

    try {
      setIsLoading(true);
      setWeather(prev => ({ ...prev, loading: true, error: null }));

      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

      // Проверка API ключа
      if (!API_KEY || API_KEY === 'ваш_ключ_здесь') {
        const demoWeather = generateDemoData(cityName);
        const demoForecast = generateDemoForecast();
        
        const demoData = {
          weather: demoWeather,
          forecast: demoForecast,
          isDemo: true,
          timestamp: now,
        };
        
        weatherCache.set(cacheKey, demoData);
        setWeather(demoWeather);
        setForecast(demoForecast);
        setIsDemo(true);
        setIsLoading(false);
        return;
      }

      setIsDemo(false);

      // Параллельные запросы для текущей погоды и прогноза
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=en`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric&cnt=5`)
      ]);

      const currentData = currentResponse.data;
      const forecastData = forecastResponse.data;

      // Расчет UV индекса и точки росы (упрощенно)
      const uvIndex = Math.min(Math.floor(currentData.main.temp / 5), 11);
      const dewPoint = currentData.main.temp - ((100 - currentData.main.humidity) / 5);

      const newWeather: WeatherData = {
        temp: Math.round(currentData.main.temp),
        feelsLike: Math.round(currentData.main.feels_like),
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        city: currentData.name,
        country: currentData.sys.country,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 10) / 10,
        windDirection: currentData.wind.deg || 0,
        pressure: currentData.main.pressure,
        visibility: currentData.visibility,
        sunrise: currentData.sys.sunrise,
        sunset: currentData.sys.sunset,
        cloudiness: currentData.clouds.all,
        uvIndex,
        dewPoint: Math.round(dewPoint * 10) / 10,
        loading: false,
        error: null,
        lastUpdated: now,
      };

      const newForecast: ForecastItem[] = forecastData.list.map((item: any) => ({
        dt: item.dt,
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
        description: item.weather[0].description,
      }));

      // Сохраняем в кэш
      weatherCache.set(cacheKey, {
        weather: newWeather,
        forecast: newForecast,
        isDemo: false,
        timestamp: now,
      });

      setWeather(newWeather);
      setForecast(newForecast);

    } catch (error: any) {
      console.error('Weather fetch error:', error);
      
      // При ошибке используем демо-данные
      const demoWeather = generateDemoData(cityName);
      const demoForecast = generateDemoForecast();
      
      setWeather({
        ...demoWeather,
        error: error.response?.data?.message || 'Failed to load weather data',
      });
      setForecast(demoForecast);
      setIsDemo(true);
    } finally {
      setIsLoading(false);
    }
  }, [generateDemoData, generateDemoForecast]);

  const refresh = useCallback(() => {
    fetchWeatherData(city, true);
  }, [city, fetchWeatherData]);

  // Основной эффект для загрузки данных
  useEffect(() => {
    if (city) {
      fetchWeatherData(city);
    }
  }, [city, fetchWeatherData]);

  // Авто-обновление каждые 15 минут
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWeatherData(city);
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [city, fetchWeatherData]);

  return {
    weather,
    forecast,
    setCity: (newCity: string) => {
      if (newCity.trim()) {
        setCity(newCity.trim());
      }
    },
    city,
    refresh,
    isLoading,
    isDemo,
  };
}

// Вспомогательные функции
export const getWindDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(degrees / 22.5) % 16];
};

export const getUVIndexLevel = (uvIndex: number): string => {
  if (uvIndex <= 2) return 'Low';
  if (uvIndex <= 5) return 'Moderate';
  if (uvIndex <= 7) return 'High';
  if (uvIndex <= 10) return 'Very High';
  return 'Extreme';
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export const getMoonPhase = (): string => {
  const phases = ['🌑 New', '🌒 Waxing Crescent', '🌓 First Quarter', '🌔 Waxing Gibbous', 
                 '🌕 Full', '🌖 Waning Gibbous', '🌗 Last Quarter', '🌘 Waning Crescent'];
  const cycle = 29.53; // Лунный цикл в днях
  const knownNewMoon = new Date('2024-01-11').getTime();
  const daysSinceNewMoon = (Date.now() - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phaseIndex = Math.floor((daysSinceNewMoon % cycle) / (cycle / 8));
  return phases[phaseIndex % phases.length];
};
// src/hooks/useWeather.ts
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
  humidity: number;
  windSpeed: number;
  loading: boolean;
  error: string | null;
}

export function useWeather(initialCity: string = 'Amsterdam') {
  const [city, setCity] = useState(initialCity);
  const [weather, setWeather] = useState<WeatherData>({
    temp: 0,
    description: '',
    icon: '',
    city: '',
    humidity: 0,
    windSpeed: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeather(prev => ({ ...prev, loading: true, error: null }));

        const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

        if (!API_KEY || API_KEY === 'ваш_ключ_здесь') {
          setWeather({
            temp: 24,
            description: 'sunny',
            icon: '01d',
            city: city,
            humidity: 65,
            windSpeed: 3.5,
            loading: false,
            error: 'Add API key to .env.local',
          });
          return;
        }

        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=en`
        );

        const data = response.data;
        
        setWeather({
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: data.name,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed),
          loading: false,
          error: null,
        });

      } catch (error: any) {
        console.error('Weather fetch error:', error);
        setWeather(prev => ({
          ...prev,
          loading: false,
          error: error.response?.data?.message || 'Failed to load weather',
        }));
      }
    };

    if (city) {
      fetchWeather();
    }

    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [city]);

  return { weather, setCity, city };
}
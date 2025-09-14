// src/components/widgets/weather-widget.tsx
'use client';
import { useEffect, useState } from 'react';

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  icon: string;
}



export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/weather')
      .then(res => res.json())
      .then(data => {
        setWeather(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="bg-white p-6 rounded-lg shadow-md border">Loading weather...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="font-semibold text-lg mb-4">Weather</h3>
      {weather && (
        <div className="text-center">
          <div className="text-4xl mb-2">{weather.icon}</div>
          <div className="text-3xl font-bold text-gray-800">{weather.temperature}°C</div>
          <div className="text-gray-600 mb-2">{weather.condition}</div>
          <div className="text-sm text-gray-500">{weather.location}</div>
          
          {/* Простая CSS анимация */}
          <div className="mt-4">
            <div className="animate-pulse inline-block">
              {weather.icon}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
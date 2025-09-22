// src/components/weather-icon.tsx
'use client';
import React from 'react';

interface WeatherIconProps {
  icon: string;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ icon, className = '' }) => {
  const getEmoji = (iconCode: string) => {
    const iconMap: Record<string, string> = {
      '01d': '☀️', // clear sky day
      '01n': '🌙', // clear sky night
      '02d': '⛅', // few clouds day
      '02n': '☁️', // few clouds night
      '03d': '☁️', // scattered clouds
      '03n': '☁️',
      '04d': '☁️', // broken clouds
      '04n': '☁️',
      '09d': '🌧️', // shower rain
      '09n': '🌧️',
      '10d': '🌦️', // rain day
      '10n': '🌧️', // rain night
      '11d': '⛈️', // thunderstorm
      '11n': '⛈️',
      '13d': '❄️', // snow
      '13n': '❄️',
      '50d': '🌫️', // mist
      '50n': '🌫️',
    };

    return iconMap[iconCode] || '🌤️';
  };

  return (
    <div className={`text-4xl ${className}`}>
      {getEmoji(icon)}
    </div>
  );
};
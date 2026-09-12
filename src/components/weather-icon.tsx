'use client';

import React from 'react';
import { normalizeWeatherCondition, type WeatherCondition } from '@/lib/weather-condition';

interface WeatherIconProps {
  icon: string;
  conditionCode?: number | null;
  className?: string;
}

const cloudPath = 'M14 58c0-9 7-16 16-16 3 0 6 1 8 2 4-10 13-16 24-16 14 0 25 9 27 22 7 1 12 6 12 13 0 8-6 14-14 14H29c-8 0-15-6-15-14Z';
const cloudShadowPath = 'M19 61c0-10 8-18 18-18 3 0 6 1 9 2 4-11 14-18 26-18 15 0 27 10 29 24 8 1 14 7 14 15 0 9-7 16-16 16H35c-9 0-16-7-16-16Z';
const cloudHighlightPath = 'M29 48c3-3 7-4 11-4 4-9 12-13 21-13 9 0 17 4 21 11-4-2-8-3-13-3-10 0-18 4-23 11-5-3-11-3-17-2Z';

function Cloud({ effects = null }: { effects?: WeatherCondition | null }) {
  return (
    <g className="ff-weather-cloud-group">
      <path className="ff-weather-cloud-shadow" d={cloudShadowPath} />
      <path className="ff-weather-cloud-body" d={cloudPath} />
      <path className="ff-weather-cloud-highlight" d={cloudHighlightPath} />
      {effects === 'rain' || effects === 'showers' || effects === 'thunderstorm' ? <path className="ff-weather-cloud-rain" d="m40 76-4 8m17-8-4 8m18-8-4 8" /> : null}
      {effects === 'snow' ? <g className="ff-weather-cloud-snow"><circle cx="41" cy="80" r="2.5" /><circle cx="54" cy="80" r="2.5" /><circle cx="67" cy="80" r="2.5" /></g> : null}
      {effects === 'thunderstorm' ? <path className="ff-weather-cloud-lightning" d="m60 71-7 10h7l-4 8 11-13h-7l5-5Z" /> : null}
      {effects === 'fog' ? <path className="ff-weather-cloud-fog" d="M25 82h67M20 87h58" /> : null}
    </g>
  );
}

function Sun() {
  return <g className="ff-weather-sun"><circle cx="35" cy="29" r="12" /><path d="M35 8v8m0 26v8M14 29h8m26 0h8M20 14l6 6m18 18 6 6M50 14l-6 6M26 38l-6 6" /></g>;
}

function Moon() {
  return <path className="ff-weather-moon" d="M49 9c-7 5-11 13-9 22 2 12 13 20 25 19 6-1 11-4 15-8-2 11-12 20-24 20-14 0-25-11-25-25S42 11 49 9Z" />;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ icon, conditionCode, className = '' }) => {
  const condition = normalizeWeatherCondition(conditionCode, icon);
  const isNight = icon.endsWith('n');
  const showCloud = condition !== 'clear';

  return (
    <svg className={`ff-weather-svg ${className}`} viewBox="0 0 120 96" role="img" aria-label={condition} focusable="false">
      {condition === 'clear' ? (isNight ? <Moon /> : <Sun />) : null}
      {condition === 'partlyCloudy' ? (isNight ? <Moon /> : <Sun />) : null}
      {showCloud ? <Cloud effects={condition === 'cloudy' || condition === 'partlyCloudy' ? null : condition} /> : null}
    </svg>
  );
};

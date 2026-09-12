'use client';

import React from 'react';
import { getWeatherVisualModel, type MoonPhase } from '@/lib/weather-visual';
import type { WeatherCondition } from '@/lib/weather-condition';

interface WeatherIconProps {
  icon: string;
  conditionCode?: number | null;
  className?: string;
  date?: Date;
  isDay?: boolean;
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
      {effects === 'rain' ? <path className="ff-weather-cloud-rain" d="m40 76-4 8m17-8-4 8m18-8-4 8" /> : null}
      {effects === 'showers' ? <path className="ff-weather-cloud-rain" d="m34 76-3 7m14-7-3 7m14-7-3 7m14-7-3 7" /> : null}
      {effects === 'thunderstorm' ? <path className="ff-weather-cloud-rain" d="m39 76-3 7m38-7-3 7" /> : null}
      {effects === 'snow' ? <g className="ff-weather-cloud-snow"><circle cx="41" cy="80" r="2.5" /><circle cx="54" cy="80" r="2.5" /><circle cx="67" cy="80" r="2.5" /></g> : null}
      {effects === 'thunderstorm' ? <path className="ff-weather-cloud-lightning" d="m60 71-7 10h7l-4 8 11-13h-7l5-5Z" /> : null}
      {effects === 'fog' ? <path className="ff-weather-cloud-fog" d="M25 82h67M20 87h58" /> : null}
    </g>
  );
}

function Sun() {
  return <g className="ff-weather-sun"><circle className="ff-weather-sun-halo" cx="38" cy="31" r="22" /><path className="ff-weather-sun-rays" d="M38 4v9m0 36v9M11 31h9m36 0h9M19 12l7 7m24 24 7 7M57 12l-7 7M26 43l-7 7" /><circle className="ff-weather-sun-disc" cx="38" cy="31" r="13" /></g>;
}

function moonLitPath(phaseFraction: number) {
  const centerX = 58;
  const centerY = 34;
  const radius = 20;
  const fraction = ((phaseFraction % 1) + 1) % 1;
  if (fraction < 0.0625 || fraction >= 0.9375) return '';
  if (fraction >= 0.4375 && fraction < 0.5625) return `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 1 0 ${centerX + radius} ${centerY} A ${radius} ${radius} 0 1 0 ${centerX - radius} ${centerY}Z`;

  const waxing = fraction < 0.5;
  const outerSweep = waxing ? 1 : 0;
  const terminatorRadius = Math.max(0.2, Math.abs(Math.cos(2 * Math.PI * fraction)) * radius);
  const innerSweep = waxing ? (fraction < 0.25 ? 0 : 1) : (fraction < 0.75 ? 0 : 1);
  const outerArc = `A ${radius} ${radius} 0 0 ${outerSweep} ${centerX} ${centerY + radius}`;
  const innerArc = `A ${terminatorRadius} ${radius} 0 0 ${innerSweep} ${centerX} ${centerY - radius}`;
  return `M ${centerX} ${centerY - radius} ${outerArc} ${innerArc}Z`;
}

function Moon({ phase }: { phase: MoonPhase }) {
  const litPath = moonLitPath(phase.phaseFraction);
  return (
    <g className="ff-weather-moon-object">
      <circle className="ff-weather-moon-shadow" cx="58" cy="34" r="20" />
      {litPath ? <path className="ff-weather-moon-disc" d={litPath} /> : null}
    </g>
  );
}

export const WeatherVisual: React.FC<WeatherIconProps> = ({ icon, conditionCode, className = '', date, isDay }) => {
  const model = getWeatherVisualModel(conditionCode, icon, date, isDay);

  return (
    <svg className={`ff-weather-svg ff-weather-state-${model.condition} ff-weather-${model.isDay ? 'day' : 'night'} ${className}`} viewBox="0 0 120 96" role="img" aria-label={model.isDay ? model.condition : `${model.condition}, ${model.moonPhase?.phaseName ?? 'night'}`} focusable="false">
      <circle className="ff-weather-atmosphere" cx="58" cy="44" r="34" aria-hidden="true" />
      {model.showStars ? <g className="ff-weather-stars" aria-hidden="true"><circle cx="22" cy="18" r="1.4" /><circle cx="84" cy="15" r="1.2" /><circle cx="96" cy="43" r="1.5" /><circle cx="31" cy="48" r="1" /></g> : null}
      {model.primaryObject === 'sun' ? <Sun /> : <Moon phase={model.moonPhase ?? { phaseName: 'New Moon', illuminationPercent: 0, phaseFraction: 0 }} />}
      {model.showCloud ? <Cloud effects={model.condition === 'cloudy' || model.condition === 'partlyCloudy' ? null : model.condition} /> : null}
    </svg>
  );
};

export const WeatherIcon = WeatherVisual;

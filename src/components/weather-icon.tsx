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
      {effects === 'drizzle' ? <path className="ff-weather-cloud-rain ff-weather-cloud-drizzle" d="m42 76-2 5m18-5-2 5m16-5-2 5" /> : null}
      {effects === 'rain' ? <path className="ff-weather-cloud-rain" d="m40 76-4 8m17-8-4 8m18-8-4 8" /> : null}
      {effects === 'showers' ? <path className="ff-weather-cloud-rain" d="m34 76-3 7m14-7-3 7m14-7-3 7m14-7-3 7" /> : null}
      {effects === 'thunderstorm' ? <path className="ff-weather-cloud-rain" d="m39 76-3 7m38-7-3 7" /> : null}
      {effects === 'snow' ? <g className="ff-weather-cloud-snow"><circle cx="41" cy="80" r="2.5" /><circle cx="54" cy="80" r="2.5" /><circle cx="67" cy="80" r="2.5" /></g> : null}
      {effects === 'thunderstorm' ? <path className="ff-weather-cloud-lightning" d="m60 71-7 10h7l-4 8 11-13h-7l5-5Z" /> : null}
      {effects === 'fog' ? <path className="ff-weather-cloud-fog" d="M25 82h67M20 87h58" /> : null}
    </g>
  );
}

function Sun({ gradientId }: { gradientId: string }) {
  return <g className="ff-weather-sun"><circle className="ff-weather-sun-halo" cx="38" cy="31" r="27" /><path className="ff-weather-sun-rays" d="M38 2v10m0 38v10M9 31h11m36 0h11M17 10l8 8m26 26 8 8M59 10l-8 8M25 44l-8 8" /><circle className="ff-weather-sun-disc" cx="38" cy="31" r="16" fill={`url(#${gradientId})`} /></g>;
}

function moonLitPath(phaseFraction: number) {
  const centerX = 58;
  const centerY = 34;
  const radius = 24;
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

function Moon({ phase, gradientId }: { phase: MoonPhase; gradientId: string }) {
  const litPath = moonLitPath(phase.phaseFraction);
  return (
    <g className="ff-weather-moon-object">
      <circle className="ff-weather-moon-shadow" cx="58" cy="34" r="24" />
      {litPath ? <path className="ff-weather-moon-disc" d={litPath} fill={`url(#${gradientId})`} /> : null}
    </g>
  );
}

export const WeatherVisual: React.FC<WeatherIconProps> = ({ icon, conditionCode, className = '', date, isDay }) => {
  const model = getWeatherVisualModel(conditionCode, icon, date, isDay);
  const visualId = React.useId().replace(/:/g, '');
  const sunGradientId = `ff-weather-sun-${visualId}`;
  const moonGradientId = `ff-weather-moon-${visualId}`;

  return (
    <svg className={`ff-weather-svg ff-weather-state-${model.condition} ff-weather-${model.isDay ? 'day' : 'night'} ${className}`} viewBox="0 0 120 96" role="img" aria-label={model.isDay ? model.condition : `${model.condition}, ${model.moonPhase?.phaseName ?? 'night'}`} focusable="false">
      <defs>
        <radialGradient id={sunGradientId} cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="white" stopOpacity="0.96" /><stop offset="0.72" stopColor="currentColor" stopOpacity="0.94" /><stop offset="1" stopColor="currentColor" stopOpacity="0.7" /></radialGradient>
        <radialGradient id={moonGradientId} cx="35%" cy="28%" r="75%"><stop offset="0" stopColor="white" stopOpacity="0.92" /><stop offset="0.8" stopColor="currentColor" stopOpacity="0.9" /><stop offset="1" stopColor="currentColor" stopOpacity="0.65" /></radialGradient>
      </defs>
      <circle className="ff-weather-atmosphere" cx="58" cy="44" r="34" aria-hidden="true" />
      {model.showStars ? <g className="ff-weather-stars" aria-hidden="true"><circle cx="22" cy="18" r="1.4" /><circle cx="84" cy="15" r="1.2" />{model.starCount > 2 ? <><circle cx="96" cy="43" r="1.5" /><circle cx="31" cy="48" r="1" /></> : null}</g> : null}
      {model.condition === 'clear' || model.condition === 'partlyCloudy' ? (model.primaryObject === 'sun' ? <Sun gradientId={sunGradientId} /> : <Moon gradientId={moonGradientId} phase={model.moonPhase ?? { phaseName: 'New Moon', illuminationPercent: 0, illumination: 0, phaseFraction: 0, waxing: false }} />) : null}
      {model.showCloud ? <Cloud effects={model.condition === 'cloudy' || model.condition === 'overcast' || model.condition === 'partlyCloudy' ? null : model.condition} /> : null}
    </svg>
  );
};

export const WeatherIcon = WeatherVisual;

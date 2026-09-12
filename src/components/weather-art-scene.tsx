'use client';

import type { ReactNode } from 'react';
import { WeatherVisual } from '@/components/weather-icon';
import type { WeatherCondition } from '@/lib/weather-condition';

type WeatherArtSceneKey = `${WeatherCondition}-${'day' | 'night'}`;

export interface WeatherArtAsset {
  key: WeatherArtSceneKey;
  src: string;
  suppressProceduralStars?: boolean;
}

const weatherArtAssets: Partial<Record<WeatherArtSceneKey, WeatherArtAsset>> = {
  'clear-night': {
    key: 'clear-night',
    src: '/weather/backgrounds/clear-night.png',
    suppressProceduralStars: true,
  },
};

export function resolveWeatherArtScene(condition: WeatherCondition, isDay: boolean): WeatherArtAsset | null {
  return weatherArtAssets[`${condition}-${isDay ? 'day' : 'night'}`] ?? null;
}

interface WeatherArtSceneProps {
  condition: WeatherCondition;
  isDay: boolean;
  icon: string;
  conditionCode?: number | null;
  date?: Date;
  variant: 'full' | 'compact';
  className: string;
  visualClassName?: string;
  children: ReactNode;
  ariaLabel?: string;
}

export function WeatherArtScene({
  condition,
  isDay,
  icon,
  conditionCode,
  date,
  variant,
  className,
  visualClassName = '',
  children,
  ariaLabel,
}: WeatherArtSceneProps) {
  const art = resolveWeatherArtScene(condition, isDay);
  const visualWrapperClass = variant === 'full' ? 'ff-weather-visual-stage' : 'ff-compact-weather-visual';
  const SceneElement = variant === 'full' ? 'section' : 'div';

  return (
    <SceneElement
      className={`ff-weather-art-scene ff-weather-art-scene-${variant} ${art ? `has-weather-art ff-weather-art-${art.key}` : 'uses-weather-visual'} ${className}`}
      data-weather-art={art?.key}
      aria-label={ariaLabel}
      role={ariaLabel ? 'group' : undefined}
    >
      {art ? (
        <>
          <span className="ff-weather-art-backdrop" style={{ backgroundImage: `url(${art.src})` }} aria-hidden="true" />
          <span className="ff-weather-art-grade" aria-hidden="true" />
        </>
      ) : null}
      <div className={visualWrapperClass} aria-hidden={variant === 'compact' ? true : undefined}>
        <WeatherVisual
          icon={icon}
          conditionCode={conditionCode}
          isDay={isDay}
          date={date}
          suppressStars={art?.suppressProceduralStars}
          className={visualClassName}
        />
      </div>
      {children}
    </SceneElement>
  );
}

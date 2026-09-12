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

function WeatherArtLayers({ art }: { art: WeatherArtAsset }) {
  return (
    <>
      <span className="ff-weather-art-backdrop" style={{ backgroundImage: `url(${art.src})` }} aria-hidden="true" />
      <span className="ff-weather-art-grade" aria-hidden="true" />
    </>
  );
}

interface WeatherArtSurfaceProps {
  condition: WeatherCondition;
  isDay: boolean;
  className: string;
  children: ReactNode;
}

export function WeatherArtSurface({ condition, isDay, className, children }: WeatherArtSurfaceProps) {
  const art = resolveWeatherArtScene(condition, isDay);

  return (
    <div
      className={`ff-weather-art-surface ff-weather-art-surface-full ${art ? `has-weather-art ff-weather-art-${art.key}` : 'uses-weather-visual'} ${className}`}
      data-weather-art={art?.key}
    >
      {art ? <WeatherArtLayers art={art} /> : null}
      {children}
    </div>
  );
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
  renderBackdrop?: boolean;
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
  renderBackdrop = true,
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
      {art && renderBackdrop ? <WeatherArtLayers art={art} /> : null}
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

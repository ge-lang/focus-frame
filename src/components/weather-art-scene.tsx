'use client';

import type { ReactNode } from 'react';
import { WeatherVisual } from '@/components/weather-icon';
import type { WeatherCondition } from '@/lib/weather-condition';
import { getWeatherScene, type WeatherScene } from '@/lib/weather-scene';

function WeatherArtLayers({ scene, variant }: { scene: WeatherScene; variant: 'full' | 'compact' }) {
  return (
    <>
      <span
        className="ff-weather-art-backdrop"
        style={{
          backgroundImage: `url(${scene.asset})`,
          backgroundPosition: variant === 'compact' ? scene.compactPosition : scene.fullPosition,
        }}
        aria-hidden="true"
      />
      <span className={`ff-weather-art-effect ff-weather-art-effect-${scene.effect}`} aria-hidden="true" />
      <span className="ff-weather-art-grade" aria-hidden="true" />
    </>
  );
}

interface WeatherArtSurfaceProps {
  condition: WeatherCondition;
  isDay: boolean;
  variant?: 'full' | 'compact';
  location?: string;
  localDate?: Date;
  className: string;
  children: ReactNode;
}

export function WeatherArtSurface({
  condition,
  isDay,
  variant = 'full',
  location,
  localDate,
  className,
  children,
}: WeatherArtSurfaceProps) {
  const scene = getWeatherScene({ condition, isDay, location, localDate });

  return (
    <div
      className={`ff-weather-art-surface ff-weather-art-surface-${variant} has-weather-art ff-weather-art-${scene.state} ${className}`}
      data-weather-art={scene.state}
      data-weather-effect={scene.effect}
      data-weather-readability={scene.readability}
      data-weather-variant={scene.variant}
    >
      <WeatherArtLayers scene={scene} variant={variant} />
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
  location?: string;
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
  location,
  variant,
  className,
  visualClassName = '',
  children,
  ariaLabel,
  renderBackdrop = true,
}: WeatherArtSceneProps) {
  const scene = getWeatherScene({ condition, isDay, location, localDate: date });
  const visualWrapperClass = variant === 'full' ? 'ff-weather-visual-stage' : 'ff-compact-weather-visual';
  const SceneElement = variant === 'full' ? 'section' : 'div';

  return (
    <SceneElement
      className={`ff-weather-art-scene ff-weather-art-scene-${variant} has-weather-art ff-weather-art-${scene.state} ${className}`}
      data-weather-art={scene.state}
      aria-label={ariaLabel}
      role={ariaLabel ? 'group' : undefined}
    >
      {renderBackdrop ? <WeatherArtLayers scene={scene} variant={variant} /> : null}
      <div className={visualWrapperClass} aria-hidden={variant === 'compact' ? true : undefined}>
        <WeatherVisual
          icon={icon}
          conditionCode={conditionCode}
          isDay={isDay}
          date={date}
          suppressStars={scene.suppressProceduralStars}
          className={visualClassName}
        />
      </div>
      {children}
    </SceneElement>
  );
}

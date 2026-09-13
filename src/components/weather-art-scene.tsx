'use client';

import { useId, type CSSProperties, type ReactNode } from 'react';
import { WeatherVisual } from '@/components/weather-icon';
import type { WeatherCondition } from '@/lib/weather-condition';
import type { WeatherLayerAssetSlot, WeatherLayerVariant } from '@/lib/weather-layer-registry';
import { getWeatherScene, type WeatherScene } from '@/lib/weather-scene';
import { calculateMoonPhase, getMoonIlluminationPath } from '@/lib/weather-visual';

function layerPlacementStyle(config: WeatherLayerAssetSlot, variant: WeatherLayerVariant): CSSProperties {
  const placement = config.placement[variant];
  return {
    left: placement.x,
    top: placement.y,
    opacity: config.opacity,
    mixBlendMode: config.blendMode,
    transform: 'translate(-50%, -50%) scale(' + placement.scale + ')',
  };
}

function WeatherBaseScene({ scene, variant }: { scene: WeatherScene; variant: WeatherLayerVariant }) {
  return (
    <span
      className="ff-weather-layer ff-weather-base-scene"
      style={{
        backgroundImage: 'url(' + scene.asset + ')',
        backgroundPosition: variant === 'compact' ? scene.compactPosition : scene.fullPosition,
      }}
      aria-hidden="true"
    />
  );
}

function WeatherCelestialLayer({ scene, variant, date }: { scene: WeatherScene; variant: WeatherLayerVariant; date?: Date }) {
  const maskId = 'ff-weather-external-moon-' + useId().replace(/:/g, '');
  const { celestial } = scene.layers;
  const primaryAsset = celestial.primary?.asset;
  const earthshineAsset = celestial.earthshine?.asset;
  const haloAsset = celestial.halo?.asset;
  const hasExternalAsset = Boolean(primaryAsset || earthshineAsset || haloAsset);
  const phase = celestial.kind === 'moon' ? calculateMoonPhase(date) : null;
  const litPath = phase ? getMoonIlluminationPath(phase.phaseFraction, 50, 50, 46) : '';
  const primaryConfig = celestial.primary;

  return (
    <span
      className="ff-weather-layer ff-weather-celestial-layer"
      data-weather-slot={celestial.slot}
      data-weather-phase-mask={celestial.phaseMask ?? undefined}
      data-weather-external={hasExternalAsset ? 'active' : 'fallback'}
      data-moon-phase={phase?.phaseFraction}
      data-moon-illumination={phase?.illumination}
      aria-hidden="true"
    >
      {celestial.kind === 'sun' && primaryAsset && primaryConfig ? (
        <span
          className="ff-weather-external-celestial ff-weather-external-sun"
          style={{ ...layerPlacementStyle(primaryConfig, variant), backgroundImage: 'url(' + primaryAsset + ')' }}
        />
      ) : null}
      {celestial.kind === 'moon' && hasExternalAsset && primaryConfig ? (
        <svg
          className="ff-weather-external-celestial ff-weather-external-moon"
          viewBox="0 0 100 100"
          style={layerPlacementStyle(primaryConfig, variant)}
        >
          <defs>
            <clipPath id={maskId + '-disc'}><circle cx="50" cy="50" r="46" /></clipPath>
            <clipPath id={maskId + '-light'}>{litPath ? <path d={litPath} /> : null}</clipPath>
          </defs>
          {haloAsset ? <image href={haloAsset} x="0" y="0" width="100" height="100" opacity={celestial.halo?.opacity} /> : null}
          {earthshineAsset ? <image href={earthshineAsset} x="4" y="4" width="92" height="92" clipPath={'url(#' + maskId + '-disc)'} opacity={celestial.earthshine?.opacity} /> : null}
          {primaryAsset && litPath ? <image href={primaryAsset} x="4" y="4" width="92" height="92" clipPath={'url(#' + maskId + '-light)'} /> : null}
        </svg>
      ) : null}
    </span>
  );
}

function externalAtmosphereStyle(config: WeatherLayerAssetSlot, variant: WeatherLayerVariant): CSSProperties {
  return {
    ...layerPlacementStyle(config, variant),
    width: '100%',
    height: '100%',
    backgroundImage: config.asset ? 'url(' + config.asset + ')' : undefined,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  };
}

function WeatherAtmosphereLayer({ scene, variant }: { scene: WeatherScene; variant: WeatherLayerVariant }) {
  const foreground = scene.layers.atmosphere.foreground;
  const externalEffects = scene.layers.atmosphere.effects.filter(({ config }) => Boolean(config.asset));
  const hasExternalEffect = externalEffects.length > 0;

  return (
    <span
      className="ff-weather-layer ff-weather-atmosphere-layer"
      data-weather-foreground-slot={foreground?.slot}
      data-weather-effect-slots={scene.layers.atmosphere.effects.map(({ slot }) => slot).join(' ') || undefined}
      data-weather-external-effect={hasExternalEffect ? 'active' : 'fallback'}
      aria-hidden="true"
    >
      {!hasExternalEffect ? <span className={'ff-weather-code-effect ff-weather-art-effect-' + scene.effect} /> : null}
      {foreground?.config.asset ? (
        <span className="ff-weather-external-atmosphere ff-weather-foreground-cloud" style={externalAtmosphereStyle(foreground.config, variant)} />
      ) : null}
      {externalEffects.map(({ slot, config }) => (
        <span key={slot} className={'ff-weather-external-atmosphere ff-weather-external-effect ff-weather-external-effect-' + slot} style={externalAtmosphereStyle(config, variant)} />
      ))}
    </span>
  );
}

function WeatherReadabilityLayer({ scene, variant }: { scene: WeatherScene; variant: WeatherLayerVariant }) {
  const readability = scene.layers.readability[variant];
  const style = {
    '--ff-weather-scrim-top': readability.top,
    '--ff-weather-scrim-hero': readability.hero,
    '--ff-weather-scrim-bottom': readability.bottom,
  } as CSSProperties;
  return <span className="ff-weather-layer ff-weather-readability-layer" style={style} aria-hidden="true" />;
}

function WeatherLayerStack({ scene, variant, date }: { scene: WeatherScene; variant: WeatherLayerVariant; date?: Date }) {
  return (
    <>
      <WeatherBaseScene scene={scene} variant={variant} />
      <WeatherCelestialLayer scene={scene} variant={variant} date={date} />
      <WeatherAtmosphereLayer scene={scene} variant={variant} />
      <WeatherReadabilityLayer scene={scene} variant={variant} />
    </>
  );
}

interface WeatherArtSurfaceProps {
  condition: WeatherCondition;
  isDay: boolean;
  variant?: WeatherLayerVariant;
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
      className={'ff-weather-art-surface ff-weather-art-surface-' + variant + ' has-weather-art ff-weather-art-' + scene.state + ' ' + className}
      data-weather-art={scene.state}
      data-weather-effect={scene.effect}
      data-weather-readability={scene.readability}
      data-weather-variant={scene.variant}
      data-weather-celestial-slot={scene.layers.celestial.slot}
      data-weather-foreground-slot={scene.layers.atmosphere.foreground?.slot}
    >
      <WeatherLayerStack scene={scene} variant={variant} date={localDate} />
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
  variant: WeatherLayerVariant;
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
      className={'ff-weather-art-scene ff-weather-art-scene-' + variant + ' has-weather-art ff-weather-art-' + scene.state + ' ' + className}
      data-weather-art={scene.state}
      data-weather-celestial-slot={scene.layers.celestial.slot}
      aria-label={ariaLabel}
      role={ariaLabel ? 'group' : undefined}
    >
      {renderBackdrop ? <WeatherLayerStack scene={scene} variant={variant} date={date} /> : null}
      <div className={visualWrapperClass} aria-hidden={variant === 'compact' ? true : undefined}>
        <WeatherVisual
          icon={icon}
          conditionCode={conditionCode}
          isDay={isDay}
          date={date}
          suppressStars={scene.suppressProceduralStars}
          suppressCelestial={Boolean(scene.layers.celestial.primary?.asset)}
          suppressCloud={Boolean(scene.layers.atmosphere.foreground?.config.asset)}
          className={visualClassName}
        />
      </div>
      {children}
    </SceneElement>
  );
}

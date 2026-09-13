import type { WeatherCondition } from './weather-condition';

export type WeatherLayerVariant = 'full' | 'compact';
export type WeatherAssetBlendMode = 'normal' | 'screen' | 'soft-light' | 'overlay' | 'lighten' | 'multiply';
export type WeatherCelestialSlot = 'none' | 'sun-clear' | 'sun-hazy' | 'sun-partly-clouded' | 'moon-texture';
export type WeatherAtmosphereSlot =
  | 'thin-cloud-veil'
  | 'scattered-foreground-cloud'
  | 'broken-cloud-accent'
  | 'dark-heavy-cloud-accent'
  | 'rain'
  | 'heavy-rain'
  | 'snow'
  | 'fog'
  | 'mist'
  | 'haze'
  | 'lightning'
  | 'stars'
  | 'subtle-glow';

export interface WeatherAssetPlacement {
  x: string;
  y: string;
  scale: number;
}

export interface WeatherLayerAssetSlot {
  /** Add the externally supplied transparent asset path here when it is available. */
  asset?: string;
  placement: Record<WeatherLayerVariant, WeatherAssetPlacement>;
  opacity: number;
  blendMode: WeatherAssetBlendMode;
}

export interface WeatherReadabilityConfig {
  top: number;
  hero: number;
  bottom: number;
}

export interface WeatherCelestialLayerPlan {
  kind: 'none' | 'sun' | 'moon';
  slot: WeatherCelestialSlot;
  primary?: WeatherLayerAssetSlot;
  lowWarm?: WeatherLayerAssetSlot;
  earthshine?: WeatherLayerAssetSlot;
  halo?: WeatherLayerAssetSlot;
  phaseMask: 'data-driven' | null;
}

export interface WeatherAtmosphereLayerPlan {
  foreground?: { slot: WeatherAtmosphereSlot; config: WeatherLayerAssetSlot };
  effects: Array<{ slot: WeatherAtmosphereSlot; config: WeatherLayerAssetSlot }>;
}

export interface WeatherLayerPlan {
  celestial: WeatherCelestialLayerPlan;
  atmosphere: WeatherAtmosphereLayerPlan;
  readability: Record<WeatherLayerVariant, WeatherReadabilityConfig>;
}

interface WeatherLayerAssetRegistry {
  celestial: {
    sunClear: WeatherLayerAssetSlot;
    sunHazy: WeatherLayerAssetSlot;
    sunPartlyClouded: WeatherLayerAssetSlot;
    sunLowWarm: WeatherLayerAssetSlot;
    moonTexture: WeatherLayerAssetSlot;
    moonEarthshine: WeatherLayerAssetSlot;
    moonHalo: WeatherLayerAssetSlot;
  };
  atmosphere: Record<WeatherAtmosphereSlot, WeatherLayerAssetSlot>;
  readability: Record<WeatherLayerVariant, WeatherReadabilityConfig>;
}

const celestialPlacement = {
  full: { x: '34%', y: '31%', scale: 1 },
  compact: { x: '27%', y: '35%', scale: 0.72 },
} satisfies Record<WeatherLayerVariant, WeatherAssetPlacement>;

const atmospherePlacement = {
  full: { x: '50%', y: '50%', scale: 1 },
  compact: { x: '50%', y: '50%', scale: 1.04 },
} satisfies Record<WeatherLayerVariant, WeatherAssetPlacement>;

function slot(
  placement: Record<WeatherLayerVariant, WeatherAssetPlacement>,
  opacity: number,
  blendMode: WeatherAssetBlendMode,
): WeatherLayerAssetSlot {
  return { placement, opacity, blendMode };
}

/**
 * Single extension point for the external transparent Weather asset pack.
 * Adding asset paths here activates the corresponding layer without changing
 * Weather components, condition mapping, or lunar calculations.
 */
export const weatherLayerAssetRegistry: WeatherLayerAssetRegistry = {
  celestial: {
    sunClear: slot(celestialPlacement, 1, 'screen'),
    sunHazy: slot(celestialPlacement, 0.86, 'screen'),
    sunPartlyClouded: slot(celestialPlacement, 0.94, 'screen'),
    sunLowWarm: slot(
      {
        full: { x: '34%', y: '38%', scale: 0.9 },
        compact: { x: '27%', y: '42%', scale: 0.66 },
      },
      0.94,
      'screen',
    ),
    moonTexture: slot(celestialPlacement, 1, 'normal'),
    moonEarthshine: slot(celestialPlacement, 0.32, 'screen'),
    moonHalo: slot(celestialPlacement, 0.72, 'screen'),
  },
  atmosphere: {
    'thin-cloud-veil': slot(atmospherePlacement, 0.34, 'soft-light'),
    'scattered-foreground-cloud': slot(atmospherePlacement, 0.48, 'normal'),
    'broken-cloud-accent': slot(atmospherePlacement, 0.52, 'normal'),
    'dark-heavy-cloud-accent': slot(atmospherePlacement, 0.58, 'multiply'),
    rain: slot(atmospherePlacement, 0.56, 'screen'),
    'heavy-rain': slot(atmospherePlacement, 0.68, 'screen'),
    snow: slot(atmospherePlacement, 0.62, 'screen'),
    fog: slot(atmospherePlacement, 0.5, 'screen'),
    mist: slot(atmospherePlacement, 0.38, 'screen'),
    haze: slot(atmospherePlacement, 0.34, 'soft-light'),
    lightning: slot(atmospherePlacement, 0.7, 'screen'),
    stars: slot(atmospherePlacement, 0.64, 'screen'),
    'subtle-glow': slot(atmospherePlacement, 0.3, 'screen'),
  },
  readability: {
    full: { top: 0.2, hero: 0.42, bottom: 0.54 },
    compact: { top: 0.12, hero: 0.32, bottom: 0.5 },
  },
};

function resolveCelestial(condition: WeatherCondition, isDay: boolean): WeatherCelestialLayerPlan {
  const { celestial } = weatherLayerAssetRegistry;

  if (!isDay && (condition === 'clear' || condition === 'partlyCloudy' || condition === 'scatteredClouds')) {
    return {
      kind: 'moon',
      slot: 'moon-texture',
      primary: celestial.moonTexture,
      earthshine: celestial.moonEarthshine,
      halo: celestial.moonHalo,
      phaseMask: 'data-driven',
    };
  }

  if (isDay && condition === 'clear') {
    return { kind: 'sun', slot: 'sun-clear', primary: celestial.sunClear, lowWarm: celestial.sunLowWarm, phaseMask: null };
  }

  if (isDay && (condition === 'partlyCloudy' || condition === 'scatteredClouds')) {
    return { kind: 'sun', slot: 'sun-partly-clouded', primary: celestial.sunPartlyClouded, lowWarm: celestial.sunLowWarm, phaseMask: null };
  }

  if (isDay && (condition === 'haze' || condition === 'mist' || condition === 'fog')) {
    return { kind: 'sun', slot: 'sun-hazy', primary: celestial.sunHazy, lowWarm: celestial.sunLowWarm, phaseMask: null };
  }

  return { kind: 'none', slot: 'none', phaseMask: null };
}

function resolveForeground(condition: WeatherCondition): WeatherAtmosphereLayerPlan['foreground'] {
  const slots = weatherLayerAssetRegistry.atmosphere;
  if (condition === 'partlyCloudy') return { slot: 'thin-cloud-veil', config: slots['thin-cloud-veil'] };
  if (condition === 'scatteredClouds') return { slot: 'scattered-foreground-cloud', config: slots['scattered-foreground-cloud'] };
  if (condition === 'cloudy') return { slot: 'broken-cloud-accent', config: slots['broken-cloud-accent'] };
  if (condition === 'overcast' || condition === 'rain' || condition === 'showers' || condition === 'thunderstorm') {
    return { slot: 'dark-heavy-cloud-accent', config: slots['dark-heavy-cloud-accent'] };
  }
  return undefined;
}

function resolveEffects(condition: WeatherCondition, isDay: boolean): WeatherAtmosphereLayerPlan['effects'] {
  const slots = weatherLayerAssetRegistry.atmosphere;
  const effects: WeatherAtmosphereLayerPlan['effects'] = [];

  if (condition === 'drizzle' || condition === 'rain') effects.push({ slot: 'rain', config: slots.rain });
  if (condition === 'showers') effects.push({ slot: 'heavy-rain', config: slots['heavy-rain'] });
  if (condition === 'thunderstorm') {
    effects.push({ slot: 'heavy-rain', config: slots['heavy-rain'] });
    effects.push({ slot: 'lightning', config: slots.lightning });
  }
  if (condition === 'snow') effects.push({ slot: 'snow', config: slots.snow });
  if (condition === 'fog') effects.push({ slot: 'fog', config: slots.fog });
  if (condition === 'mist') effects.push({ slot: 'mist', config: slots.mist });
  if (condition === 'haze') effects.push({ slot: 'haze', config: slots.haze });
  if (!isDay && (condition === 'clear' || condition === 'partlyCloudy' || condition === 'scatteredClouds')) {
    effects.push({ slot: 'stars', config: slots.stars });
  }
  if (isDay && condition === 'clear') effects.push({ slot: 'subtle-glow', config: slots['subtle-glow'] });

  return effects;
}

export function getWeatherLayerPlan(condition: WeatherCondition, isDay: boolean): WeatherLayerPlan {
  return {
    celestial: resolveCelestial(condition, isDay),
    atmosphere: {
      foreground: resolveForeground(condition),
      effects: resolveEffects(condition, isDay),
    },
    readability: weatherLayerAssetRegistry.readability,
  };
}

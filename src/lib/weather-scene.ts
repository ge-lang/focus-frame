import type { WeatherCondition } from './weather-condition';
import { getWeatherLayerPlan, type WeatherLayerPlan } from './weather-layer-registry';

export type WeatherScenePeriod = 'day' | 'night';
export type WeatherSceneState =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'scattered-clouds-day'
  | 'scattered-clouds-night'
  | 'cloudy-day'
  | 'cloudy-night'
  | 'overcast-day'
  | 'overcast-night'
  | 'drizzle-day'
  | 'drizzle-night'
  | 'rain-day'
  | 'rain-night'
  | 'showers-day'
  | 'showers-night'
  | 'thunderstorm-day'
  | 'thunderstorm-night'
  | 'snow-day'
  | 'snow-night'
  | 'fog-day'
  | 'fog-night'
  | 'mist-day'
  | 'mist-night'
  | 'haze-day'
  | 'haze-night';

export type WeatherSceneEffect = 'none' | 'drizzle' | 'rain' | 'showers' | 'storm' | 'snow' | 'fog' | 'mist' | 'haze';
export type WeatherSceneReadability = 'luminous' | 'day' | 'night' | 'wet' | 'storm' | 'soft';

export interface WeatherSceneVariant {
  asset: `/weather/backgrounds/${string}.webp`;
  fullPosition: string;
  compactPosition: string;
}

interface WeatherSceneDefinition {
  state: WeatherSceneState;
  effect: WeatherSceneEffect;
  readability: WeatherSceneReadability;
  suppressProceduralStars: boolean;
  variants: readonly WeatherSceneVariant[];
}

export interface WeatherScene extends Omit<WeatherSceneDefinition, 'variants'>, WeatherSceneVariant {
  variant: number;
  layers: WeatherLayerPlan;
}

export interface WeatherSceneInput {
  condition: WeatherCondition | null | undefined;
  isDay: boolean;
  location?: string;
  localDate?: Date | string;
}

const stateByCondition = {
  clear: { day: 'clear-day', night: 'clear-night' },
  partlyCloudy: { day: 'partly-cloudy-day', night: 'partly-cloudy-night' },
  scatteredClouds: { day: 'scattered-clouds-day', night: 'scattered-clouds-night' },
  cloudy: { day: 'cloudy-day', night: 'cloudy-night' },
  overcast: { day: 'overcast-day', night: 'overcast-night' },
  drizzle: { day: 'drizzle-day', night: 'drizzle-night' },
  rain: { day: 'rain-day', night: 'rain-night' },
  showers: { day: 'showers-day', night: 'showers-night' },
  thunderstorm: { day: 'thunderstorm-day', night: 'thunderstorm-night' },
  snow: { day: 'snow-day', night: 'snow-night' },
  fog: { day: 'fog-day', night: 'fog-night' },
  mist: { day: 'mist-day', night: 'mist-night' },
  haze: { day: 'haze-day', night: 'haze-night' },
} as const satisfies Record<WeatherCondition, Record<WeatherScenePeriod, WeatherSceneState>>;

const conditionByState = Object.fromEntries(
  Object.entries(stateByCondition).flatMap(([condition, periods]) => [
    [periods.day, condition],
    [periods.night, condition],
  ]),
) as Record<WeatherSceneState, WeatherCondition>;

function variant(
  state: WeatherSceneState,
  fullPosition = '50% 50%',
  compactPosition = fullPosition,
): readonly WeatherSceneVariant[] {
  return [{ asset: `/weather/backgrounds/${state}.webp`, fullPosition, compactPosition }];
}

const sceneByState: Record<WeatherSceneState, WeatherSceneDefinition> = {
  'clear-day': { state: 'clear-day', effect: 'none', readability: 'luminous', suppressProceduralStars: true, variants: variant('clear-day', '50% 52%', '44% 58%') },
  'clear-night': { state: 'clear-night', effect: 'none', readability: 'night', suppressProceduralStars: true, variants: variant('clear-night', '50% 53%', '42% 58%') },
  'partly-cloudy-day': { state: 'partly-cloudy-day', effect: 'none', readability: 'luminous', suppressProceduralStars: true, variants: variant('partly-cloudy-day', '50% 52%', '42% 56%') },
  'partly-cloudy-night': { state: 'partly-cloudy-night', effect: 'none', readability: 'night', suppressProceduralStars: true, variants: variant('partly-cloudy-night', '50% 52%', '44% 57%') },
  'scattered-clouds-day': { state: 'scattered-clouds-day', effect: 'none', readability: 'day', suppressProceduralStars: true, variants: variant('scattered-clouds-day', '50% 52%', '46% 56%') },
  'scattered-clouds-night': { state: 'scattered-clouds-night', effect: 'none', readability: 'night', suppressProceduralStars: true, variants: variant('scattered-clouds-night', '50% 52%', '46% 57%') },
  'cloudy-day': { state: 'cloudy-day', effect: 'none', readability: 'day', suppressProceduralStars: true, variants: variant('cloudy-day', '50% 52%', '48% 56%') },
  'cloudy-night': { state: 'cloudy-night', effect: 'none', readability: 'night', suppressProceduralStars: true, variants: variant('cloudy-night', '50% 52%', '48% 57%') },
  'overcast-day': { state: 'overcast-day', effect: 'none', readability: 'soft', suppressProceduralStars: true, variants: variant('overcast-day', '50% 54%', '48% 58%') },
  'overcast-night': { state: 'overcast-night', effect: 'none', readability: 'night', suppressProceduralStars: true, variants: variant('overcast-night', '50% 54%', '48% 58%') },
  'drizzle-day': { state: 'drizzle-day', effect: 'drizzle', readability: 'wet', suppressProceduralStars: true, variants: variant('drizzle-day', '50% 57%', '46% 60%') },
  'drizzle-night': { state: 'drizzle-night', effect: 'drizzle', readability: 'wet', suppressProceduralStars: true, variants: variant('drizzle-night', '50% 57%', '46% 60%') },
  'rain-day': { state: 'rain-day', effect: 'rain', readability: 'wet', suppressProceduralStars: true, variants: variant('rain-day', '50% 58%', '52% 60%') },
  'rain-night': { state: 'rain-night', effect: 'rain', readability: 'wet', suppressProceduralStars: true, variants: variant('rain-night', '50% 58%', '52% 60%') },
  'showers-day': { state: 'showers-day', effect: 'showers', readability: 'wet', suppressProceduralStars: true, variants: variant('showers-day', '50% 56%', '54% 59%') },
  'showers-night': { state: 'showers-night', effect: 'showers', readability: 'wet', suppressProceduralStars: true, variants: variant('showers-night', '50% 56%', '54% 59%') },
  'thunderstorm-day': { state: 'thunderstorm-day', effect: 'storm', readability: 'storm', suppressProceduralStars: true, variants: variant('thunderstorm-day', '50% 55%', '58% 58%') },
  'thunderstorm-night': { state: 'thunderstorm-night', effect: 'storm', readability: 'storm', suppressProceduralStars: true, variants: variant('thunderstorm-night', '50% 54%', '62% 58%') },
  'snow-day': { state: 'snow-day', effect: 'snow', readability: 'soft', suppressProceduralStars: true, variants: variant('snow-day', '50% 55%', '48% 58%') },
  'snow-night': { state: 'snow-night', effect: 'snow', readability: 'night', suppressProceduralStars: true, variants: variant('snow-night', '50% 55%', '48% 58%') },
  'fog-day': { state: 'fog-day', effect: 'fog', readability: 'soft', suppressProceduralStars: true, variants: variant('fog-day', '50% 54%', '50% 58%') },
  'fog-night': { state: 'fog-night', effect: 'fog', readability: 'night', suppressProceduralStars: true, variants: variant('fog-night', '50% 54%', '50% 58%') },
  'mist-day': { state: 'mist-day', effect: 'mist', readability: 'soft', suppressProceduralStars: true, variants: variant('mist-day', '50% 54%', '48% 58%') },
  'mist-night': { state: 'mist-night', effect: 'mist', readability: 'night', suppressProceduralStars: true, variants: variant('mist-night', '50% 54%', '48% 58%') },
  'haze-day': { state: 'haze-day', effect: 'haze', readability: 'soft', suppressProceduralStars: true, variants: variant('haze-day', '50% 54%', '52% 58%') },
  'haze-night': { state: 'haze-night', effect: 'haze', readability: 'night', suppressProceduralStars: true, variants: variant('haze-night', '50% 54%', '52% 58%') },
};

const fallbackState: Record<WeatherScenePeriod, WeatherSceneState> = {
  day: 'cloudy-day',
  night: 'cloudy-night',
};

function normalizedLocalDay(value?: Date | string): string {
  if (!value) return 'undated';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 'undated' : date.toISOString().slice(0, 10);
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function resolveWeatherSceneState(
  condition: WeatherCondition | null | undefined,
  isDay: boolean,
): WeatherSceneState {
  const period: WeatherScenePeriod = isDay ? 'day' : 'night';
  const pair = condition ? stateByCondition[condition] : undefined;
  return pair?.[period] ?? fallbackState[period];
}

export function getWeatherScene(input: WeatherSceneInput): WeatherScene {
  const state = resolveWeatherSceneState(input.condition, input.isDay);
  const definition = sceneByState[state];
  const seed = `${input.location?.trim().toLowerCase() || 'unknown'}|${state}|${normalizedLocalDay(input.localDate)}`;
  const selectedVariant = stableHash(seed) % definition.variants.length;

  return {
    state: definition.state,
    effect: definition.effect,
    readability: definition.readability,
    suppressProceduralStars: definition.suppressProceduralStars,
    variant: selectedVariant,
    layers: getWeatherLayerPlan(conditionByState[state], input.isDay),
    ...definition.variants[selectedVariant],
  };
}

export const weatherSceneStates = Object.freeze(Object.keys(sceneByState) as WeatherSceneState[]);

import { isWeatherDay, normalizeWeatherCondition, type WeatherCondition } from './weather-condition';

export type MoonPhaseName =
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Waning Crescent';

export interface MoonPhase {
  phaseName: MoonPhaseName;
  illuminationPercent: number;
  phaseFraction: number;
}

export interface WeatherVisualModel {
  condition: WeatherCondition;
  isDay: boolean;
  primaryObject: 'sun' | 'moon';
  showCloud: boolean;
  showStars: boolean;
  moonPhase: MoonPhase | null;
}

const SYNODIC_MONTH_DAYS = 29.530588853;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14);

export function calculateMoonPhase(date = new Date()): MoonPhase {
  const elapsedDays = (date.getTime() - KNOWN_NEW_MOON_UTC) / 86_400_000;
  const phaseFraction = ((elapsedDays / SYNODIC_MONTH_DAYS) % 1 + 1) % 1;
  const illuminationPercent = Math.round((0.5 * (1 - Math.cos(2 * Math.PI * phaseFraction))) * 100);
  const phaseName = phaseNameForFraction(phaseFraction);

  return { phaseName, illuminationPercent, phaseFraction };
}

export function phaseNameForFraction(phaseFraction: number): MoonPhaseName {
  const fraction = ((phaseFraction % 1) + 1) % 1;
  if (fraction < 0.0625 || fraction >= 0.9375) return 'New Moon';
  if (fraction < 0.1875) return 'Waxing Crescent';
  if (fraction < 0.3125) return 'First Quarter';
  if (fraction < 0.4375) return 'Waxing Gibbous';
  if (fraction < 0.5625) return 'Full Moon';
  if (fraction < 0.6875) return 'Waning Gibbous';
  if (fraction < 0.8125) return 'Last Quarter';
  return 'Waning Crescent';
}

export function getWeatherVisualModel(conditionCode?: number | null, icon = '', date = new Date(), isDayOverride?: boolean): WeatherVisualModel {
  const condition = normalizeWeatherCondition(conditionCode, icon);
  const isDay = isDayOverride ?? isWeatherDay(icon);

  return {
    condition,
    isDay,
    primaryObject: isDay ? 'sun' : 'moon',
    showCloud: condition !== 'clear',
    showStars: !isDay && condition === 'clear',
    moonPhase: isDay ? null : calculateMoonPhase(date),
  };
}

export function formatMoonPhase(phase: MoonPhase): string {
  return `${phase.phaseName} · ${phase.illuminationPercent}%`;
}

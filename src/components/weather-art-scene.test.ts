import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { WeatherCondition } from '@/lib/weather-condition';
import { calculateMoonPhase } from '@/lib/weather-visual';
import { getWeatherScene, resolveWeatherSceneState, weatherSceneStates } from '@/lib/weather-scene';

const expectedStates = [
  ['clear', 'clear'],
  ['partlyCloudy', 'partly-cloudy'],
  ['scatteredClouds', 'scattered-clouds'],
  ['cloudy', 'cloudy'],
  ['overcast', 'overcast'],
  ['drizzle', 'drizzle'],
  ['rain', 'rain'],
  ['showers', 'showers'],
  ['thunderstorm', 'thunderstorm'],
  ['snow', 'snow'],
  ['fog', 'fog'],
  ['mist', 'mist'],
  ['haze', 'haze'],
] as const satisfies readonly (readonly [WeatherCondition, string])[];

describe('weather scene selection', () => {
  it('covers every normalized condition in day and night', () => {
    expect(weatherSceneStates).toHaveLength(26);

    for (const [condition, slug] of expectedStates) {
      expect(resolveWeatherSceneState(condition, true)).toBe(`${slug}-day`);
      expect(resolveWeatherSceneState(condition, false)).toBe(`${slug}-night`);
      expect(getWeatherScene({ condition, isDay: true }).asset).toBe(`/weather/backgrounds/${slug}-day.webp`);
      expect(getWeatherScene({ condition, isDay: false }).asset).toBe(`/weather/backgrounds/${slug}-night.webp`);
      expect(existsSync(join(process.cwd(), 'public', 'weather', 'backgrounds', `${slug}-day.webp`))).toBe(true);
      expect(existsSync(join(process.cwd(), 'public', 'weather', 'backgrounds', `${slug}-night.webp`))).toBe(true);
    }
  });

  it('uses a deterministic day/night fallback for unsupported input', () => {
    expect(resolveWeatherSceneState(null, true)).toBe('cloudy-day');
    expect(resolveWeatherSceneState(undefined, false)).toBe('cloudy-night');
    expect(resolveWeatherSceneState('unsupported' as WeatherCondition, true)).toBe('cloudy-day');
  });

  it('keeps the selected scene stable for the same city, condition, and local date', () => {
    const input = { condition: 'clear' as const, isDay: false, location: 'Krasnoyarsk, Russia', localDate: new Date('2026-09-12T10:00:00Z') };
    expect(getWeatherScene(input)).toEqual(getWeatherScene(input));
  });

  it('keeps Moon phase data independent from the selected background asset', () => {
    const firstDate = new Date('2026-01-01T00:00:00Z');
    const secondDate = new Date('2026-01-15T00:00:00Z');
    const firstScene = getWeatherScene({ condition: 'clear', isDay: false, location: 'Madrid', localDate: firstDate });
    const secondScene = getWeatherScene({ condition: 'clear', isDay: false, location: 'Madrid', localDate: secondDate });

    expect(firstScene.asset).toBe(secondScene.asset);
    expect(calculateMoonPhase(firstDate).phaseFraction).not.toBe(calculateMoonPhase(secondDate).phaseFraction);
  });
});

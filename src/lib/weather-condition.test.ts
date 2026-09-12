import { describe, expect, it } from 'vitest';
import { isWeatherDay, normalizeWeatherCondition } from './weather-condition';

describe('weather condition normalization', () => {
  it.each([
    [800, '01d', 'clear'],
    [800, '01n', 'clear'],
    [801, '02d', 'partlyCloudy'],
    [802, '03d', 'cloudy'],
    [500, '10d', 'rain'],
    [300, '09d', 'showers'],
    [201, '11d', 'thunderstorm'],
    [601, '13d', 'snow'],
    [741, '50d', 'fog'],
  ] as const)('maps provider code %s to %s', (code, icon, expected) => {
    expect(normalizeWeatherCondition(code, icon)).toBe(expected);
  });

  it('uses the icon as a safe fallback when a provider code is missing', () => {
    expect(normalizeWeatherCondition(null, '01n')).toBe('clear');
    expect(normalizeWeatherCondition(undefined, '11d')).toBe('thunderstorm');
    expect(normalizeWeatherCondition(undefined, 'unknown')).toBe('cloudy');
  });

  it('keeps day/night tied to the provider icon, not the user clock', () => {
    expect(isWeatherDay('01d')).toBe(true);
    expect(isWeatherDay('01n')).toBe(false);
  });
});

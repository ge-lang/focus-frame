import { describe, expect, it } from 'vitest';
import { getWeatherLocationKey, restoreWeatherLocation } from './useWeather';

describe('shared weather location helpers', () => {
  it('restores a saved location with coordinates and supports the older city shape', () => {
    expect(restoreWeatherLocation(JSON.stringify({ name: 'Minsk', country: 'BY', lat: 53.9, lon: 27.56 }))).toMatchObject({
      name: 'Minsk', country: 'BY', lat: 53.9, lon: 27.56,
    });
    expect(restoreWeatherLocation(JSON.stringify({ city: 'Paris', country: 'FR' }))).toMatchObject({ name: 'Paris', country: 'FR' });
    expect(restoreWeatherLocation(JSON.stringify({ name: 'Ghent', country: 'be' }))).toMatchObject({ name: 'Ghent', country: 'BE' });
  });

  it('uses one stable identity for the same selected location', () => {
    expect(getWeatherLocationKey({ name: 'Minsk', country: 'BY', lat: 53.9, lon: 27.56 })).toBe(
      getWeatherLocationKey({ name: 'Minsk', country: 'BY', lat: 53.9, lon: 27.56 }),
    );
    expect(getWeatherLocationKey({ name: 'Paris', country: 'FR' })).not.toBe(getWeatherLocationKey({ name: 'Minsk', country: 'BY' }));
  });
});

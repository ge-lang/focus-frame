import { describe, expect, it } from 'vitest';
import {
  getWeatherLocationKey,
  resolveInitialWeatherLocation,
  restoreWeatherLocation,
  type WeatherLocation,
} from './useWeather';

const storedLocation: WeatherLocation = { name: 'Brussels', country: 'BE' };

describe('Weather location initialization', () => {
  it('prefers the account-backed widget location over device-local storage', () => {
    expect(resolveInitialWeatherLocation('Yalta', 'UA', storedLocation)).toMatchObject({ name: 'Yalta', country: 'UA' });
  });

  it('uses device-local storage only when no account-backed widget location exists', () => {
    expect(resolveInitialWeatherLocation('', undefined, storedLocation)).toEqual(storedLocation);
  });
});

describe('shared weather location helpers', () => {
  it('restores a saved location with coordinates and supports the older city shape', () => {
    expect(restoreWeatherLocation(JSON.stringify({ name: 'Minsk', country: 'BY', lat: 53.9, lon: 27.56 }))).toMatchObject({
      name: 'Minsk',
      country: 'BY',
      lat: 53.9,
      lon: 27.56,
    });
    expect(restoreWeatherLocation(JSON.stringify({ city: 'Paris', country: 'FR' }))).toMatchObject({
      name: 'Paris',
      country: 'FR',
    });
    expect(restoreWeatherLocation(JSON.stringify({ name: 'Ghent', country: 'be' }))).toMatchObject({
      name: 'Ghent',
      country: 'BE',
    });
  });

  it('uses one stable identity for the same selected location', () => {
    expect(getWeatherLocationKey({ name: 'Paris', country: 'FR' })).toBe(
      getWeatherLocationKey({ name: 'Paris', country: 'fr' }),
    );
    expect(getWeatherLocationKey({ name: 'Paris', country: 'FR' })).not.toBe(
      getWeatherLocationKey({ name: 'Minsk', country: 'BY' }),
    );
  });
});

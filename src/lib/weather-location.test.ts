import { describe, expect, it } from 'vitest';
import {
  deduplicateWeatherResults,
  findCountryForCity,
  getDefaultCityForCountry,
  getPopularCitiesForCountry,
  resolveCountrySelection,
} from './weather-location';

describe('weather location helpers', () => {
  it('resets an incompatible city to the selected country capital', () => {
    expect(resolveCountrySelection('NL', 'Ghent')).toBe('Amsterdam');
    expect(resolveCountrySelection('BE', 'Ghent')).toBe('Ghent');
  });

  it('provides a small country-scoped city list', () => {
    expect(getDefaultCityForCountry('BE')).toBe('Brussels');
    expect(getPopularCitiesForCountry('NL')).toContain('Amsterdam');
    expect(getPopularCitiesForCountry('XX')).toEqual([]);
    expect(resolveCountrySelection('KH', '')).toBe('Phnom Penh');
    expect(resolveCountrySelection('AL', '')).toBe('Tirana');
  });

  it('finds the country for known cities', () => {
    expect(findCountryForCity('Paris')).toBe('FR');
    expect(findCountryForCity('unknown city')).toBeUndefined();
  });

  it('removes duplicate provider rows by city, region and country', () => {
    const results = deduplicateWeatherResults([
      { name: 'Paris', state: 'Île-de-France', country: 'FR', lat: 48.85, lon: 2.35 },
      { name: ' paris ', state: 'île-de-france', country: 'fr', lat: 48.86, lon: 2.34 },
      { name: 'Springfield', state: 'Illinois', country: 'US', lat: 39.8, lon: -89.6 },
      { name: 'Springfield', state: 'Massachusetts', country: 'US', lat: 42.1, lon: -72.6 },
    ]);

    expect(results).toHaveLength(3);
    expect(results.map((result) => result.state)).toEqual(['Île-de-France', 'Illinois', 'Massachusetts']);
  });
});

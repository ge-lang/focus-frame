import { describe, expect, it } from 'vitest';
import {
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
  });

  it('finds the country for known cities', () => {
    expect(findCountryForCity('Paris')).toBe('FR');
    expect(findCountryForCity('unknown city')).toBeUndefined();
  });
});

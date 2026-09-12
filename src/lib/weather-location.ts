export interface WeatherLocationDefaults {
  capital: string;
  popular: string[];
}

export interface WeatherSearchResult {
  name: string;
  state: string | null;
  country: string;
  lat: number;
  lon: number;
}

const countryLocations: Record<string, WeatherLocationDefaults> = {
  BE: { capital: 'Brussels', popular: ['Brussels', 'Antwerp', 'Ghent', 'Bruges'] },
  NL: { capital: 'Amsterdam', popular: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'] },
  FR: { capital: 'Paris', popular: ['Paris', 'Lyon', 'Marseille', 'Nice'] },
  DE: { capital: 'Berlin', popular: ['Berlin', 'Hamburg', 'Munich', 'Cologne'] },
  GB: { capital: 'London', popular: ['London', 'Manchester', 'Birmingham', 'Edinburgh'] },
  US: { capital: 'Washington', popular: ['Washington', 'New York', 'Los Angeles', 'Chicago'] },
  ES: { capital: 'Madrid', popular: ['Madrid', 'Barcelona', 'Valencia', 'Seville'] },
  IT: { capital: 'Rome', popular: ['Rome', 'Milan', 'Naples', 'Turin'] },
  CA: { capital: 'Ottawa', popular: ['Ottawa', 'Toronto', 'Montreal', 'Vancouver'] },
  AU: { capital: 'Canberra', popular: ['Canberra', 'Sydney', 'Melbourne', 'Brisbane'] },
  AL: { capital: 'Tirana', popular: ['Tirana', 'Durrës', 'Vlorë'] },
  KH: { capital: 'Phnom Penh', popular: ['Phnom Penh', 'Siem Reap', 'Battambang'] },
};

export function getWeatherLocationDefaults(countryCode?: string): WeatherLocationDefaults | undefined {
  return countryCode ? countryLocations[countryCode.toUpperCase()] : undefined;
}

export function getDefaultCityForCountry(countryCode: string): string {
  return getWeatherLocationDefaults(countryCode)?.capital ?? '';
}

export function getPopularCitiesForCountry(countryCode?: string): string[] {
  return getWeatherLocationDefaults(countryCode)?.popular ?? [];
}

export function resolveCountrySelection(countryCode: string, currentCity: string): string {
  const defaults = getWeatherLocationDefaults(countryCode);
  if (!defaults) return '';

  const matchingCity = defaults.popular.find((city) => city.toLowerCase() === currentCity.trim().toLowerCase());
  return matchingCity ?? defaults.capital;
}

export function findCountryForCity(city: string): string | undefined {
  const normalizedCity = city.trim().toLowerCase();
  return Object.entries(countryLocations).find(([, defaults]) =>
    defaults.popular.some((popularCity) => popularCity.toLowerCase() === normalizedCity),
  )?.[0];
}

const verboseLocationPrefixes = [
  /^city\s+of\s+/i,
  /^municipality\s+of\s+/i,
  /^metropolitan\s+city\s+of\s+/i,
];

/**
 * Returns a concise presentation label without changing the provider's
 * canonical location name or the value persisted in widget configuration.
 */
export function getWeatherDisplayName(locationName: string): string {
  const trimmedName = locationName.trim();
  return verboseLocationPrefixes.reduce(
    (displayName, prefix) => displayName.replace(prefix, ''),
    trimmedName,
  );
}

function normalizeLocationPart(value: string | null | undefined): string {
  return (value ?? '').trim().toLocaleLowerCase();
}

export function deduplicateWeatherResults(results: WeatherSearchResult[]): WeatherSearchResult[] {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = [result.name, result.state, result.country].map(normalizeLocationPart).join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

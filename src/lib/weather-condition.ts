export type WeatherCondition =
  | 'clear'
  | 'partlyCloudy'
  | 'cloudy'
  | 'overcast'
  | 'drizzle'
  | 'rain'
  | 'showers'
  | 'thunderstorm'
  | 'snow'
  | 'fog'
  | 'mist'
  | 'haze';

export function normalizeWeatherCondition(conditionCode?: number | null, icon = ''): WeatherCondition {
  if (typeof conditionCode === 'number') {
    if (conditionCode >= 200 && conditionCode < 300) return 'thunderstorm';
    if (conditionCode >= 300 && conditionCode < 400) return 'drizzle';
    if (conditionCode >= 500 && conditionCode < 600) {
      if (conditionCode === 511) return 'snow';
      if (conditionCode >= 520) return 'showers';
      return 'rain';
    }
    if (conditionCode >= 600 && conditionCode < 700) return 'snow';
    if (conditionCode === 701) return 'mist';
    if (conditionCode === 721) return 'haze';
    if (conditionCode >= 700 && conditionCode < 800) return 'fog';
    if (conditionCode === 800) return 'clear';
    if (conditionCode === 801) return 'partlyCloudy';
    if (conditionCode === 802) return 'cloudy';
    if (conditionCode >= 803 && conditionCode < 900) return 'overcast';
  }

  if (icon.startsWith('01')) return 'clear';
  if (icon.startsWith('02')) return 'partlyCloudy';
  if (icon.startsWith('03')) return 'cloudy';
  if (icon.startsWith('04')) return 'overcast';
  if (icon.startsWith('09')) return 'showers';
  if (icon.startsWith('10')) return 'rain';
  if (icon.startsWith('11')) return 'thunderstorm';
  if (icon.startsWith('13')) return 'snow';
  if (icon.startsWith('50')) return 'fog';
  return 'cloudy';
}

export function isWeatherDay(icon = ''): boolean {
  return icon.endsWith('d');
}

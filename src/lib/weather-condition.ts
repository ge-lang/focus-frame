export type WeatherCondition =
  | 'clear'
  | 'partlyCloudy'
  | 'cloudy'
  | 'rain'
  | 'showers'
  | 'thunderstorm'
  | 'snow'
  | 'fog';

export function normalizeWeatherCondition(conditionCode?: number | null, icon = ''): WeatherCondition {
  if (typeof conditionCode === 'number') {
    if (conditionCode >= 200 && conditionCode < 300) return 'thunderstorm';
    if (conditionCode >= 300 && conditionCode < 400) return 'showers';
    if (conditionCode >= 500 && conditionCode < 600) return conditionCode === 511 ? 'snow' : 'rain';
    if (conditionCode >= 600 && conditionCode < 700) return 'snow';
    if (conditionCode >= 700 && conditionCode < 800) return 'fog';
    if (conditionCode === 800) return 'clear';
    if (conditionCode === 801) return 'partlyCloudy';
    if (conditionCode >= 802 && conditionCode < 900) return 'cloudy';
  }

  if (icon.startsWith('01')) return 'clear';
  if (icon.startsWith('02')) return 'partlyCloudy';
  if (icon.startsWith('03') || icon.startsWith('04')) return 'cloudy';
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

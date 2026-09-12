import { describe, expect, it } from 'vitest';
import { resolveWeatherArtScene } from './weather-art-scene';

describe('weather art scene resolver', () => {
  it('selects the production art only for clear night', () => {
    expect(resolveWeatherArtScene('clear', false)).toEqual({
      key: 'clear-night',
      src: '/weather/backgrounds/clear-night.png',
      suppressProceduralStars: true,
    });
  });

  it('keeps every other state on the existing visual fallback', () => {
    expect(resolveWeatherArtScene('clear', true)).toBeNull();
    expect(resolveWeatherArtScene('partlyCloudy', false)).toBeNull();
    expect(resolveWeatherArtScene('cloudy', true)).toBeNull();
    expect(resolveWeatherArtScene('rain', false)).toBeNull();
  });
});

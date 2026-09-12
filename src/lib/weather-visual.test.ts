import { describe, expect, it } from 'vitest';
import { formatMoonPhase, getWeatherVisualModel, phaseNameForFraction } from './weather-visual';

describe('weather visual model', () => {
  it('selects a substantial sun object for a clear day', () => {
    const model = getWeatherVisualModel(800, '01d');

    expect(model.primaryObject).toBe('sun');
    expect(model.showCloud).toBe(false);
    expect(model.showStars).toBe(false);
  });

  it('selects a phase-aware moon and stars for a clear night', () => {
    const model = getWeatherVisualModel(800, '01n', new Date('2026-09-12T00:00:00Z'));

    expect(model.primaryObject).toBe('moon');
    expect(model.moonPhase).not.toBeNull();
    expect(model.showCloud).toBe(false);
    expect(model.showStars).toBe(true);
    expect(formatMoonPhase(model.moonPhase!)).toMatch(/%$/);
  });

  it('changes the calculated moon phase for different known dates', () => {
    const first = getWeatherVisualModel(800, '01n', new Date('2026-01-01T00:00:00Z')).moonPhase;
    const second = getWeatherVisualModel(800, '01n', new Date('2026-01-15T00:00:00Z')).moonPhase;

    expect(first?.phaseFraction).not.toBe(second?.phaseFraction);
    expect(phaseNameForFraction(0)).toBe('New Moon');
    expect(phaseNameForFraction(0.5)).toBe('Full Moon');
  });

  it('uses the same object language for partly cloudy day and night', () => {
    const day = getWeatherVisualModel(801, '02d', new Date('2026-09-12T00:00:00Z'));
    const night = getWeatherVisualModel(801, '02n', new Date('2026-09-12T00:00:00Z'));

    expect(day).toMatchObject({ condition: 'partlyCloudy', primaryObject: 'sun', showCloud: true, showStars: false });
    expect(night).toMatchObject({ condition: 'partlyCloudy', primaryObject: 'moon', showCloud: true, showStars: false });
  });

  it('preserves visual mappings for rain, snow, storm, and fog', () => {
    expect(getWeatherVisualModel(500, '10d').condition).toBe('rain');
    expect(getWeatherVisualModel(601, '13d').condition).toBe('snow');
    expect(getWeatherVisualModel(201, '11d').condition).toBe('thunderstorm');
    expect(getWeatherVisualModel(741, '50d').condition).toBe('fog');
    expect(getWeatherVisualModel(500, '10n').showStars).toBe(false);
  });

  it('keeps the model shared by compact and full consumers', () => {
    const compactModel = getWeatherVisualModel(800, '01n', new Date('2026-09-12T00:00:00Z'));
    const fullModel = getWeatherVisualModel(800, '01n', new Date('2026-09-12T00:00:00Z'));

    expect(fullModel).toEqual(compactModel);
  });
});

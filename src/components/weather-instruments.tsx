'use client';

interface WindCompassProps {
  degrees: number;
}

interface UvGaugeProps {
  value: number;
}

interface DayArcProps {
  sunrise: number;
  sunset: number;
  timezoneOffsetSeconds?: number;
  now?: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function WindCompass({ degrees }: WindCompassProps) {
  const normalizedDegrees = ((degrees % 360) + 360) % 360;
  return (
    <svg className="ff-weather-wind-compass" viewBox="0 0 40 40" role="img" aria-label={`Wind direction ${Math.round(normalizedDegrees)} degrees`}>
      <circle className="ff-weather-instrument-track" cx="20" cy="20" r="14" />
      <path className="ff-weather-compass-pointer" d="m20 7 3.2 13-3.2 2.8-3.2-2.8Z" transform={`rotate(${normalizedDegrees} 20 20)`} />
      <circle className="ff-weather-instrument-center" cx="20" cy="20" r="2.2" />
    </svg>
  );
}

export function UvGauge({ value }: UvGaugeProps) {
  const normalizedValue = clamp(value, 0, 11);
  const dashOffset = 66 - (normalizedValue / 11) * 66;
  return (
    <svg className="ff-weather-uv-gauge" viewBox="0 0 40 28" role="img" aria-label={`UV index ${normalizedValue}`}>
      <path className="ff-weather-instrument-track" d="M5 23a15 15 0 0 1 30 0" pathLength="66" />
      <path className="ff-weather-uv-progress" d="M5 23a15 15 0 0 1 30 0" pathLength="66" strokeDasharray="66" strokeDashoffset={dashOffset} />
    </svg>
  );
}

export function formatWeatherTime(timestamp: number, timezoneOffsetSeconds = 0): string {
  const targetDate = new Date((timestamp + timezoneOffsetSeconds) * 1000);
  return `${String(targetDate.getUTCHours()).padStart(2, '0')}:${String(targetDate.getUTCMinutes()).padStart(2, '0')}`;
}

export function DayArc({ sunrise, sunset, timezoneOffsetSeconds = 0, now = Math.floor(Date.now() / 1000) }: DayArcProps) {
  const span = Math.max(sunset - sunrise, 1);
  const progress = clamp((now - sunrise) / span, 0, 1);
  const angle = Math.PI * (1 - progress);
  const dotX = 20 + Math.cos(angle) * 15;
  const dotY = 23 - Math.sin(angle) * 15;
  const durationMinutes = Math.max(Math.round(span / 60), 0);
  const daylightDuration = `${Math.floor(durationMinutes / 60)}h ${String(durationMinutes % 60).padStart(2, '0')}m`;

  return (
    <div className="ff-weather-day-arc" role="img" aria-label={`Sunrise ${formatWeatherTime(sunrise, timezoneOffsetSeconds)}, sunset ${formatWeatherTime(sunset, timezoneOffsetSeconds)}`}>
      <svg viewBox="0 0 40 26" aria-hidden="true">
        <path className="ff-weather-instrument-track" d="M5 23a15 15 0 0 1 30 0" />
        <circle className="ff-weather-day-progress" cx={dotX} cy={dotY} r="2.2" />
      </svg>
      <div className="ff-weather-day-times">
        <span className="ff-weather-day-time"><strong>{formatWeatherTime(sunrise, timezoneOffsetSeconds)}</strong><small>Sunrise</small></span>
        <span className="ff-weather-day-time"><strong>{formatWeatherTime(sunset, timezoneOffsetSeconds)}</strong><small>Sunset</small></span>
      </div>
      <span className="ff-weather-day-duration">Daylight {daylightDuration}</span>
    </div>
  );
}

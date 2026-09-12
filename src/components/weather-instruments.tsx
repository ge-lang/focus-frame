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
  const isDaylight = now >= sunrise && now <= sunset;
  const dotX = 16 + progress * 368;
  const dotY = 82 - Math.sin(Math.PI * progress) * 62;
  const durationMinutes = Math.max(Math.round(span / 60), 0);
  const daylightDuration = `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`;
  const sunriseLabel = formatWeatherTime(sunrise, timezoneOffsetSeconds);
  const sunsetLabel = formatWeatherTime(sunset, timezoneOffsetSeconds);

  return (
    <div className={`ff-weather-day-instrument ${isDaylight ? 'is-daylight' : 'is-night'}`} role="img" aria-label={`Sunrise ${sunriseLabel}, sunset ${sunsetLabel}`}>
      <span className="ff-weather-day-time ff-weather-sunrise-time"><strong>{sunriseLabel}</strong><small>Sunrise</small></span>
      <div className="ff-weather-day-arc">
        <svg viewBox="0 0 400 92" aria-hidden="true">
          <path className="ff-weather-horizon-line" d="M8 82H392" />
          <path className="ff-weather-day-track" d="M16 82C83 7 317 7 384 82" pathLength="100" />
          {isDaylight ? <path className="ff-weather-day-active-track" d="M16 82C83 7 317 7 384 82" pathLength="100" strokeDasharray={`${progress * 100} 100`} /> : null}
          {isDaylight ? (
            <g className="ff-weather-day-sun" transform={`translate(${dotX} ${dotY})`}>
              <circle className="ff-weather-day-sun-halo" r="9" />
              <path d="M0-13V-10M0 10v3M-13 0h3M10 0h3M-9-9l2 2M7 7l2 2M9-9 7-7M-9 9l2-2" />
              <circle r="5.5" />
            </g>
          ) : null}
          <circle className="ff-weather-horizon-node" cx="16" cy="82" r="2.2" />
          <circle className="ff-weather-horizon-node" cx="384" cy="82" r="2.2" />
        </svg>
        <span className="ff-weather-day-duration">Daylight {daylightDuration}</span>
      </div>
      <span className="ff-weather-day-time ff-weather-sunset-time"><strong>{sunsetLabel}</strong><small>Sunset</small></span>
    </div>
  );
}

import axios from 'axios';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';

export async function GET(request: NextRequest) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const { searchParams } = request.nextUrl;
  const city = searchParams.get('city')?.trim();
  const country = searchParams.get('country')?.trim().toUpperCase();
  const search = searchParams.get('search')?.trim();

  if (!apiKey) return NextResponse.json({ error: 'Weather service is not configured' }, { status: 503 });

  try {
    if (search) {
      if (search.length < 2) return NextResponse.json([]);
      const response = await axios.get(GEO_API_URL, {
        params: { q: country ? `${search},${country}` : search, limit: 8, appid: apiKey },
      });
      return NextResponse.json(response.data.map((location: { name: string; state?: string; country: string; lat: number; lon: number }) => ({
        name: location.name,
        state: location.state ?? null,
        country: location.country.toUpperCase(),
        lat: location.lat,
        lon: location.lon,
      })));
    }

    if (!city) return NextResponse.json({ error: 'A city is required' }, { status: 400 });
    const query = country ? `${city},${country}` : city;
    const [currentResponse, forecastResponse] = await Promise.all([
      axios.get(`${WEATHER_API_URL}/weather`, { params: { q: query, units: 'metric', lang: 'en', appid: apiKey } }),
      axios.get(`${WEATHER_API_URL}/forecast`, { params: { q: query, units: 'metric', cnt: 5, appid: apiKey } }),
    ]);
    const current = currentResponse.data;

    return NextResponse.json({
      weather: {
        temp: Math.round(current.main.temp),
        feelsLike: Math.round(current.main.feels_like),
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        city: current.name,
        country: current.sys.country,
        humidity: current.main.humidity,
        windSpeed: Math.round(current.wind.speed * 10) / 10,
        windDirection: current.wind.deg ?? 0,
        pressure: current.main.pressure,
        visibility: current.visibility,
        sunrise: current.sys.sunrise,
        sunset: current.sys.sunset,
        cloudiness: current.clouds.all,
        uvIndex: Math.min(Math.floor(current.main.temp / 5), 11),
        dewPoint: Math.round((current.main.temp - ((100 - current.main.humidity) / 5)) * 10) / 10,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      },
      forecast: forecastResponse.data.list.map((item: { dt: number; main: { temp: number }; weather: { icon: string; description: string }[] }) => ({
        dt: item.dt,
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon,
        description: item.weather[0].description,
      })),
    });
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (status === 404) return NextResponse.json({ error: 'City not found' }, { status: 404 });
    if (status === 429) return NextResponse.json({ error: 'Weather service rate limit reached' }, { status: 429 });
    if (status === 401 || status === 403) return NextResponse.json({ error: 'Weather service is not configured' }, { status: 503 });
    return NextResponse.json({ error: 'Weather service is temporarily unavailable' }, { status: 502 });
  }
}

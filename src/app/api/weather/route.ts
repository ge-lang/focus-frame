// src/app/api/weather/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=Amsterdam&units=metric&appid=${API_KEY}`
    );

    const weatherData = {
      temperature: Math.round(response.data.main.temp),
      condition: response.data.weather[0].main,
      location: response.data.name,
      icon: response.data.weather[0].icon
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    // Fallback data
    return NextResponse.json({
      temperature: 24,
      condition: 'Sunny',
      location: 'Amsterdam',
      icon: '☀️'
    });
  }
}
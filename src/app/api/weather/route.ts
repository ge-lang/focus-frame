// src/app/api/weather/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Amsterdam&units=metric&appid=${API_KEY}`
    );
    
    const data = await response.json();
    
    const weatherData = {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      location: data.name,
      icon: getWeatherIcon(data.weather[0].icon)
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    // Заглушка на время ошибки
    return NextResponse.json({
      temperature: 24,
      condition: 'Sunny',
      location: 'Amsterdam',
      icon: '☀️'
    });
  }
}

function getWeatherIcon(iconCode: string) {
  const icons: { [key: string]: string } = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '⛅',
    '03d': '☁️', '03n': '☁️',
    // ... остальные иконки
  };
  return icons[iconCode] || '🌤️';
}
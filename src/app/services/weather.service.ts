import { Injectable, signal } from '@angular/core';

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  condition: string;
}

export interface ForecastDay {
  date: Date;
  dayName: string;
  high: number;
  low: number;
  precipChance: number;
  condition: string;
  icon: string;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  precipChance: number;
  icon: string;
}

export interface WeatherData {
  location: string;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: ForecastDay[];
  alerts?: WeatherAlert[];
  lastUpdated: Date;
}

export interface WeatherAlert {
  event: string;
  headline: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  description: string;
  start: Date;
  end: Date;
}

export interface RadarConfig {
  lat: number;
  lon: number;
  zoom: number;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private _weather = signal<WeatherData | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly weather = this._weather.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // OpenWeatherMap API key - in production, this should be in environment variables
  // For demo, we'll use simulated data
  private apiKey = 'YOUR_API_KEY'; // Replace with actual key

  /**
   * Fetch weather data for a location
   * @param lat Latitude
   * @param lon Longitude
   * @param locationName Optional location name for display
   */
  async fetchWeather(lat: number, lon: number, locationName?: string): Promise<WeatherData | null> {
    this._loading.set(true);
    this._error.set(null);

    try {
      // In production, call actual API:
      // const response = await fetch(
      //   `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=imperial`
      // );

      // For demo, return simulated data
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = this.getSimulatedWeather(lat, lon, locationName);
      this._weather.set(data);
      return data;
    } catch (e) {
      this._error.set('Unable to fetch weather data');
      return null;
    } finally {
      this._loading.set(false);
    }
  }

  /**
   * Fetch weather by zip code
   */
  async fetchWeatherByZip(zipCode: string, country = 'US'): Promise<WeatherData | null> {
    // In production, first geocode the zip to lat/lon
    // For demo, use simulated data
    const coords = this.zipToCoords(zipCode);
    return this.fetchWeather(coords.lat, coords.lon, `${zipCode}, ${country}`);
  }

  /**
   * Get radar URL for embedding
   */
  getRadarUrl(lat: number, lon: number, zoom = 8): string {
    // Using OpenWeatherMap radar tiles (requires API key in production)
    // Alternative: Weather.gov radar or Windy.com embed
    return `https://openweathermap.org/weathermap?basemap=map&cities=false&layer=radar&lat=${lat}&lon=${lon}&zoom=${zoom}`;
  }

  /**
   * Get weather icon emoji based on condition
   */
  getWeatherEmoji(condition: string): string {
    const conditionMap: Record<string, string> = {
      'clear': '☀️',
      'sunny': '☀️',
      'partly_cloudy': '⛅',
      'cloudy': '☁️',
      'overcast': '☁️',
      'rain': '🌧️',
      'light_rain': '🌦️',
      'heavy_rain': '⛈️',
      'thunderstorm': '⛈️',
      'snow': '❄️',
      'light_snow': '🌨️',
      'heavy_snow': '❄️',
      'fog': '🌫️',
      'mist': '🌫️',
      'windy': '💨',
      'hot': '🔥',
      'cold': '🥶'
    };
    return conditionMap[condition.toLowerCase()] || '🌤️';
  }

  /**
   * Get severity color for weather alerts
   */
  getAlertColor(severity: string): string {
    const colors: Record<string, string> = {
      minor: 'amber',
      moderate: 'orange',
      severe: 'red',
      extreme: 'purple'
    };
    return colors[severity] || 'gray';
  }

  // Simulated weather data for demo
  private getSimulatedWeather(lat: number, lon: number, locationName?: string): WeatherData {
    const now = new Date();
    const conditions = ['clear', 'partly_cloudy', 'cloudy', 'light_rain', 'rain'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

    // Generate hourly forecast
    const hourly: HourlyForecast[] = [];
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now);
      hour.setHours(hour.getHours() + i);
      hourly.push({
        time: hour.toLocaleTimeString('en-US', { hour: 'numeric' }),
        temp: Math.round(55 + Math.random() * 20),
        precipChance: Math.round(Math.random() * 100),
        icon: conditions[Math.floor(Math.random() * conditions.length)]
      });
    }

    // Generate daily forecast
    const daily: ForecastDay[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() + i);
      daily.push({
        date: day,
        dayName: i === 0 ? 'Today' : dayNames[day.getDay()],
        high: Math.round(60 + Math.random() * 20),
        low: Math.round(40 + Math.random() * 15),
        precipChance: Math.round(Math.random() * 100),
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        icon: conditions[Math.floor(Math.random() * conditions.length)]
      });
    }

    return {
      location: locationName || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      current: {
        temp: Math.round(55 + Math.random() * 20),
        feelsLike: Math.round(53 + Math.random() * 20),
        humidity: Math.round(40 + Math.random() * 40),
        windSpeed: Math.round(5 + Math.random() * 15),
        description: this.formatCondition(randomCondition),
        icon: randomCondition,
        condition: randomCondition
      },
      hourly,
      daily,
      alerts: Math.random() > 0.7 ? [{
        event: 'Wind Advisory',
        headline: 'Wind Advisory in effect until tomorrow morning',
        severity: 'moderate' as const,
        description: 'Southwest winds 25 to 35 mph with gusts up to 50 mph expected.',
        start: now,
        end: new Date(now.getTime() + 12 * 60 * 60 * 1000)
      }] : undefined,
      lastUpdated: now
    };
  }

  private formatCondition(condition: string): string {
    return condition.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private zipToCoords(zip: string): { lat: number; lon: number } {
    // Simplified - in production use geocoding API
    const zipCoords: Record<string, { lat: number; lon: number }> = {
      '90210': { lat: 34.09, lon: -118.41 }, // Beverly Hills
      '10001': { lat: 40.75, lon: -73.99 }, // NYC
      '60601': { lat: 41.88, lon: -87.62 }, // Chicago
      '77001': { lat: 29.76, lon: -95.37 }, // Houston
      '85001': { lat: 33.45, lon: -112.07 }, // Phoenix
    };
    return zipCoords[zip] || { lat: 34.05, lon: -118.24 }; // Default to LA
  }
}

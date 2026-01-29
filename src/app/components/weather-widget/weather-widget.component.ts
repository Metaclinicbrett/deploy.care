import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WeatherService, WeatherData, ForecastDay, HourlyForecast, WeatherAlert } from '../../services/weather.service';

@Component({
  selector: 'app-weather-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="text-white font-medium">{{ weather()?.location || 'Loading...' }}</span>
          </div>
          <button
            (click)="toggleView()"
            class="text-white/80 hover:text-white text-sm"
          >
            {{ showRadar() ? 'Forecast' : 'Radar' }}
          </button>
        </div>
      </div>

      <!-- Loading state -->
      @if (weatherService.loading()) {
        <div class="p-8 text-center">
          <div class="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-sm text-gray-500 dark:text-gray-400">Loading weather...</p>
        </div>
      }

      <!-- Weather data -->
      @if (weather() && !weatherService.loading()) {
        <!-- Alerts -->
        @if (weather()!.alerts && weather()!.alerts!.length > 0) {
          <div class="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2">
            @for (alert of weather()!.alerts; track alert.event) {
              <div class="flex items-center gap-2 text-sm">
                <span class="text-amber-600 dark:text-amber-400">⚠️</span>
                <span class="text-amber-800 dark:text-amber-200 font-medium">{{ alert.event }}:</span>
                <span class="text-amber-700 dark:text-amber-300">{{ alert.headline }}</span>
              </div>
            }
          </div>
        }

        <!-- Radar View -->
        @if (showRadar()) {
          <div class="aspect-video bg-gray-100 dark:bg-gray-900 relative">
            <iframe
              [src]="radarUrl()"
              class="w-full h-full border-0"
              loading="lazy"
              title="Weather Radar"
            ></iframe>
            <div class="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              Live Radar
            </div>
          </div>
        }

        <!-- Forecast View -->
        @if (!showRadar()) {
          <!-- Current conditions -->
          <div class="p-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="flex items-baseline gap-2">
                  <span class="text-5xl font-bold text-gray-900 dark:text-white">
                    {{ weather()!.current.temp }}°
                  </span>
                  <span class="text-gray-500 dark:text-gray-400 text-lg">F</span>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mt-1">
                  {{ weather()!.current.description }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Feels like {{ weather()!.current.feelsLike }}°
                </p>
              </div>
              <div class="text-6xl">
                {{ weatherService.getWeatherEmoji(weather()!.current.condition) }}
              </div>
            </div>

            <!-- Quick stats -->
            <div class="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-300">
              <div class="flex items-center gap-1">
                <span>💧</span>
                <span>{{ weather()!.current.humidity }}%</span>
              </div>
              <div class="flex items-center gap-1">
                <span>💨</span>
                <span>{{ weather()!.current.windSpeed }} mph</span>
              </div>
            </div>
          </div>

          <!-- Hourly forecast -->
          <div class="border-t border-gray-100 dark:border-gray-700 px-4 py-3">
            <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Hourly</h4>
            <div class="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              @for (hour of weather()!.hourly.slice(0, 12); track hour.time) {
                <div class="flex flex-col items-center shrink-0">
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ hour.time }}</span>
                  <span class="text-lg my-1">{{ weatherService.getWeatherEmoji(hour.icon) }}</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ hour.temp }}°</span>
                  @if (hour.precipChance > 20) {
                    <span class="text-xs text-blue-500">{{ hour.precipChance }}%</span>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Daily forecast -->
          <div class="border-t border-gray-100 dark:border-gray-700 px-4 py-3">
            <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">7-Day Forecast</h4>
            <div class="space-y-2">
              @for (day of weather()!.daily; track day.dayName) {
                <div class="flex items-center justify-between py-1">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">{{ day.dayName }}</span>
                  <div class="flex items-center gap-2">
                    @if (day.precipChance > 20) {
                      <span class="text-xs text-blue-500">💧 {{ day.precipChance }}%</span>
                    }
                    <span class="text-lg">{{ weatherService.getWeatherEmoji(day.condition) }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <span class="font-medium text-gray-900 dark:text-white">{{ day.high }}°</span>
                    <span class="text-gray-400 dark:text-gray-500">{{ day.low }}°</span>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Footer -->
        <div class="border-t border-gray-100 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
          <p class="text-xs text-gray-400 dark:text-gray-500 text-center">
            Updated {{ weather()!.lastUpdated | date:'shortTime' }}
          </p>
        </div>
      }

      <!-- Error state -->
      @if (weatherService.error()) {
        <div class="p-8 text-center">
          <span class="text-3xl mb-2 block">🌤️</span>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ weatherService.error() }}</p>
          <button
            (click)="refresh()"
            class="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Try again
          </button>
        </div>
      }
    </div>
  `
})
export class WeatherWidgetComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);
  weatherService = inject(WeatherService);

  @Input() lat = 34.05;
  @Input() lon = -118.24;
  @Input() zipCode?: string;
  @Input() locationName?: string;

  showRadar = signal(false);
  weather = computed(() => this.weatherService.weather());

  radarUrl = computed((): SafeResourceUrl => {
    const url = this.weatherService.getRadarUrl(this.lat, this.lon);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  ngOnInit() {
    this.loadWeather();
  }

  async loadWeather() {
    if (this.zipCode) {
      await this.weatherService.fetchWeatherByZip(this.zipCode);
    } else {
      await this.weatherService.fetchWeather(this.lat, this.lon, this.locationName);
    }
  }

  toggleView() {
    this.showRadar.update(v => !v);
  }

  refresh() {
    this.loadWeather();
  }
}

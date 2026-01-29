import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationDetails } from '../../models/care-plan.model';

@Component({
  selector: 'app-location-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2">
      <!-- Logo or fallback -->
      <div
        class="flex-shrink-0 rounded-lg overflow-hidden flex items-center justify-center"
        [class]="sizeClasses()"
        [style.background-color]="brandColor() || '#6366f1'"
      >
        @if (logoSrc() && !hasLogoError()) {
          <img
            [src]="logoSrc()"
            [alt]="locationName() + ' logo'"
            class="w-full h-full object-cover"
            (error)="onLogoError()"
          />
        } @else {
          <span class="text-white font-bold" [class]="initialsSize()">
            {{ initials() }}
          </span>
        }
      </div>

      <!-- Location info -->
      @if (shouldShowDetails()) {
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
            {{ locationName() }}
          </p>
          @if (locationCity()) {
            <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
              {{ locationCity() }}@if (locationState()) {, {{ locationState() }}}
            </p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class LocationLogoComponent {
  @Input() set location(value: LocationDetails | undefined) {
    this._location.set(value);
  }

  @Input() set logoUrl(value: string | undefined) {
    this._logoUrl.set(value);
  }

  @Input() set providerName(value: string | undefined) {
    this._providerName.set(value);
  }

  @Input() set size(value: 'sm' | 'md' | 'lg') {
    this._size.set(value);
  }

  @Input() set showDetails(value: boolean) {
    this._showDetails.set(value);
  }

  private _location = signal<LocationDetails | undefined>(undefined);
  private _logoUrl = signal<string | undefined>(undefined);
  private _providerName = signal<string | undefined>(undefined);
  private _size = signal<'sm' | 'md' | 'lg'>('md');
  private _showDetails = signal<boolean>(true);
  private _logoError = signal<boolean>(false);

  readonly shouldShowDetails = computed(() => this._showDetails());
  readonly hasLogoError = computed(() => this._logoError());

  readonly logoSrc = computed(() => {
    const loc = this._location();
    return this._logoUrl() || loc?.logoUrl;
  });

  readonly brandColor = computed(() => {
    const loc = this._location();
    return loc?.brandColor;
  });

  readonly locationName = computed(() => {
    const loc = this._location();
    return loc?.name || this._providerName() || 'Unknown';
  });

  readonly locationCity = computed(() => {
    const loc = this._location();
    return loc?.city;
  });

  readonly locationState = computed(() => {
    const loc = this._location();
    return loc?.state;
  });

  readonly initials = computed(() => {
    const name = this.locationName();
    return name
      .split(' ')
      .map((word: string) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  });

  readonly sizeClasses = computed(() => {
    const size = this._size();
    const sizeMap = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-14 h-14'
    };
    return sizeMap[size];
  });

  readonly initialsSize = computed(() => {
    const size = this._size();
    const sizeMap = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-lg'
    };
    return sizeMap[size];
  });

  onLogoError() {
    this._logoError.set(true);
  }
}

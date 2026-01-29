import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientExperienceType, EXPERIENCE_TYPE_CONFIGS, ExperienceTypeConfig } from '../../models/care-plan.model';

@Component({
  selector: 'app-experience-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Single badge mode -->
    @if (!isMultiple()) {
      <div
        class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all"
        [class]="badgeClasses()"
        [style.background-color]="getCustomColor()"
        [title]="config()?.description || ''"
      >
        <span class="text-sm">{{ config()?.icon }}</span>
        @if (shouldShowLabel()) {
          <span>{{ config()?.label }}</span>
        }
      </div>
    }

    <!-- Multiple badges mode -->
    @if (isMultiple() && experienceTypes().length > 0) {
      <div class="flex flex-wrap gap-1.5">
        @for (expType of experienceTypes(); track expType) {
          <div
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all"
            [class]="getBadgeClasses(expType)"
            [title]="getConfig(expType)?.description || ''"
          >
            <span class="text-sm">{{ getConfig(expType)?.icon }}</span>
            @if (shouldShowLabel()) {
              <span>{{ getConfig(expType)?.label }}</span>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `]
})
export class ExperienceBadgeComponent {
  // Single type mode
  @Input() set type(value: PatientExperienceType | undefined) {
    this._type.set(value);
  }

  // Multiple types mode
  @Input() set types(value: PatientExperienceType[] | undefined) {
    this._types.set(value || []);
  }

  @Input() set showLabel(value: boolean) {
    this._showLabel.set(value);
  }

  @Input() set size(value: 'sm' | 'md' | 'lg') {
    this._size.set(value);
  }

  @Input() set customColor(value: string | undefined) {
    this._customColor.set(value);
  }

  private _type = signal<PatientExperienceType | undefined>(undefined);
  private _types = signal<PatientExperienceType[]>([]);
  private _showLabel = signal<boolean>(true);
  private _size = signal<'sm' | 'md' | 'lg'>('md');
  private _customColor = signal<string | undefined>(undefined);

  readonly shouldShowLabel = computed(() => this._showLabel());
  readonly getCustomColor = computed(() => this._customColor() || null);
  readonly isMultiple = computed(() => this._types().length > 0);
  readonly experienceTypes = computed(() => this._types());

  readonly config = computed(() => {
    const type = this._type();
    return type ? EXPERIENCE_TYPE_CONFIGS[type] : undefined;
  });

  readonly badgeClasses = computed(() => {
    const config = this.config();
    const size = this._size();
    const customColor = this._customColor();

    const sizeClasses = {
      sm: 'text-[10px] px-1.5 py-0.5',
      md: 'text-xs px-2 py-1',
      lg: 'text-sm px-3 py-1.5'
    };

    if (customColor) {
      return `${sizeClasses[size]} text-white`;
    }

    const colorClasses = this.getColorClasses(config?.defaultColor || 'gray');
    return `${sizeClasses[size]} ${colorClasses}`;
  });

  getConfig(type: PatientExperienceType): ExperienceTypeConfig | undefined {
    return EXPERIENCE_TYPE_CONFIGS[type];
  }

  getBadgeClasses(type: PatientExperienceType): string {
    const config = this.getConfig(type);
    const size = this._size();

    const sizeClasses = {
      sm: 'text-[10px] px-1.5 py-0.5',
      md: 'text-xs px-2 py-1',
      lg: 'text-sm px-3 py-1.5'
    };

    const colorClasses = this.getColorClasses(config?.defaultColor || 'gray');
    return `${sizeClasses[size]} ${colorClasses}`;
  }

  private getColorClasses(color: string): string {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colorMap[color] || colorMap['gray'];
  }
}

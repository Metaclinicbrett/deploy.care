import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarePlan } from '../../models/care-plan.model';
import { CareTypeBadgeComponent } from '../shared/care-type-badge/care-type-badge.component';
import { PricingBadgeComponent } from '../shared/pricing-badge/pricing-badge.component';
import { RequirementIndicatorsComponent } from '../shared/requirement-indicators/requirement-indicators.component';
import { ExperienceBadgeComponent } from '../experience-badge/experience-badge.component';
import { LocationLogoComponent } from '../location-logo/location-logo.component';

@Component({
  selector: 'app-care-plan-list',
  standalone: true,
  imports: [
    CommonModule,
    CareTypeBadgeComponent,
    PricingBadgeComponent,
    RequirementIndicatorsComponent,
    ExperienceBadgeComponent,
    LocationLogoComponent
  ],
  template: `
    <div class="space-y-3">
      @for (plan of plans; track plan.id) {
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 overflow-hidden">
          <div class="flex items-stretch">
            <!-- Color accent with brand color -->
            <div
              class="w-1.5"
              [style.background]="getAccentStyle(plan)"
            ></div>

            <div class="flex-1 p-4">
              <div class="flex items-start justify-between gap-4">
                <!-- Left: Main Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="font-semibold text-gray-900 dark:text-white text-lg">{{ plan.name }}</h3>
                    <app-care-type-badge [type]="plan.careType" />
                  </div>

                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{{ plan.description }}</p>

                  <!-- Experience Types Row -->
                  @if (plan.experienceTypes && plan.experienceTypes.length > 0) {
                    <div class="mb-3">
                      <app-experience-badge
                        [types]="plan.experienceTypes"
                        [showLabel]="true"
                        size="sm"
                      />
                    </div>
                  } @else if (plan.experienceType) {
                    <div class="mb-3">
                      <app-experience-badge
                        [type]="plan.experienceType"
                        [showLabel]="true"
                        size="sm"
                      />
                    </div>
                  }

                  <!-- Diagnosis Codes -->
                  <div class="mb-3">
                    <div class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">ICD-10 DIAGNOSIS CODES</div>
                    <div class="flex flex-wrap gap-1.5">
                      @for (dx of plan.diagnosisCodes.slice(0, 3); track dx.code) {
                        <span
                          class="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-900/50 rounded-md border border-gray-200 dark:border-gray-600 text-xs cursor-help"
                          [title]="dx.description">
                          <span class="font-mono font-semibold text-gray-700 dark:text-gray-300">{{ dx.code }}</span>
                          <span class="text-gray-400 dark:text-gray-500 max-w-[120px] truncate">{{ dx.description }}</span>
                        </span>
                      }
                      @if (plan.diagnosisCodes.length > 3) {
                        <span class="text-xs text-gray-400 self-center">+{{ plan.diagnosisCodes.length - 3 }} more</span>
                      }
                    </div>
                  </div>

                  <!-- CPT Codes -->
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-medium text-gray-500 dark:text-gray-400">CPT:</span>
                    <div class="flex gap-1">
                      @for (cpt of plan.cptCodes; track cpt) {
                        <span class="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-mono">
                          {{ cpt }}
                        </span>
                      }
                    </div>
                  </div>
                </div>

                <!-- Right: Provider, Pricing & Actions -->
                <div class="flex flex-col items-end gap-3 shrink-0">
                  <!-- Location Logo -->
                  <app-location-logo
                    [location]="plan.locationDetails"
                    [logoUrl]="plan.logoUrl"
                    [providerName]="plan.provider"
                    size="sm"
                    [showDetails]="true"
                  />

                  <app-pricing-badge [model]="plan.pricingModel" [price]="plan.price" [unit]="plan.priceUnit" />

                  <app-requirement-indicators [plan]="plan" />

                  <button class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                    New Encounter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CarePlanListComponent {
  @Input({ required: true }) plans!: CarePlan[];

  getAccentStyle(plan: CarePlan): string {
    if (plan.locationDetails?.brandColor) {
      const color = plan.locationDetails.brandColor;
      return `linear-gradient(to bottom, ${color}, ${this.adjustColor(color, -20)})`;
    }
    return this.getAccentGradient(plan.color);
  }

  getAccentGradient(color: string): string {
    const gradients: Record<string, string> = {
      'amber': 'linear-gradient(to bottom, #fbbf24, #d97706)',
      'blue': 'linear-gradient(to bottom, #60a5fa, #2563eb)',
      'purple': 'linear-gradient(to bottom, #a78bfa, #7c3aed)',
      'pink': 'linear-gradient(to bottom, #f472b6, #db2777)',
      'teal': 'linear-gradient(to bottom, #2dd4bf, #0d9488)'
    };
    return gradients[color] || gradients['blue'];
  }

  adjustColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }
}

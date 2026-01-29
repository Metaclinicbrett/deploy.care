import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarePlan } from '../../models/care-plan.model';
import { CareTypeBadgeComponent } from '../shared/care-type-badge/care-type-badge.component';
import { PricingBadgeComponent } from '../shared/pricing-badge/pricing-badge.component';
import { RequirementIndicatorsComponent } from '../shared/requirement-indicators/requirement-indicators.component';
import { ExperienceBadgeComponent } from '../experience-badge/experience-badge.component';
import { LocationLogoComponent } from '../location-logo/location-logo.component';

@Component({
  selector: 'app-care-plan-card',
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
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      @for (plan of plans; track plan.id) {
        <div class="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-transparent hover:ring-2 hover:ring-blue-500/20 transition-all duration-300 overflow-hidden">
          <!-- Header with gradient and brand color -->
          <div
            class="h-2"
            [style.background]="getHeaderStyle(plan)"
          ></div>

          <div class="p-5">
            <!-- Provider with Location Logo -->
            <div class="flex items-center justify-between mb-3">
              <app-location-logo
                [location]="plan.locationDetails"
                [logoUrl]="plan.logoUrl"
                [providerName]="plan.provider"
                size="sm"
                [showDetails]="true"
              />
              <app-care-type-badge [type]="plan.careType" />
            </div>

            <!-- Name & Description -->
            <h3 class="font-semibold text-gray-900 dark:text-white text-lg mb-2 group-hover:text-blue-600 transition">{{ plan.name }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{{ plan.description }}</p>

            <!-- Experience Types -->
            @if (plan.experienceTypes && plan.experienceTypes.length > 0) {
              <div class="mb-4">
                <app-experience-badge
                  [types]="plan.experienceTypes"
                  [showLabel]="true"
                  size="sm"
                />
              </div>
            } @else if (plan.experienceType) {
              <div class="mb-4">
                <app-experience-badge
                  [type]="plan.experienceType"
                  [showLabel]="true"
                  size="sm"
                />
              </div>
            }

            <!-- Diagnosis Codes Section -->
            <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <div class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                DIAGNOSIS CODES
              </div>
              <div class="space-y-1.5">
                @for (dx of plan.diagnosisCodes.slice(0, 2); track dx.code) {
                  <div class="flex items-center gap-2">
                    <code class="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">{{ dx.code }}</code>
                    <span class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ dx.description }}</span>
                  </div>
                }
                @if (plan.diagnosisCodes.length > 2) {
                  <button class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium">
                    +{{ plan.diagnosisCodes.length - 2 }} more codes
                  </button>
                }
              </div>
            </div>

            <!-- CPT Codes -->
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400">CPT:</span>
              <div class="flex flex-wrap gap-1">
                @for (cpt of plan.cptCodes.slice(0, 3); track cpt) {
                  <span class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-mono font-medium">
                    {{ cpt }}
                  </span>
                }
                @if (plan.cptCodes.length > 3) {
                  <span class="text-xs text-gray-400">+{{ plan.cptCodes.length - 3 }}</span>
                }
              </div>
            </div>

            <!-- Pricing -->
            <div class="flex items-center justify-between mb-4">
              <app-pricing-badge [model]="plan.pricingModel" [price]="plan.price" [unit]="plan.priceUnit" />
            </div>

            <!-- Requirements -->
            <div class="mb-4">
              <app-requirement-indicators [plan]="plan" />
            </div>

            <!-- Action -->
            <button class="w-full py-2.5 border-2 border-blue-600 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-600 hover:text-white transition-all">
              New Encounter
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class CarePlanCardComponent {
  @Input({ required: true }) plans!: CarePlan[];

  getHeaderStyle(plan: CarePlan): string {
    if (plan.locationDetails?.brandColor) {
      const color = plan.locationDetails.brandColor;
      return `linear-gradient(to right, ${color}, ${this.adjustColor(color, 20)})`;
    }
    return this.getHeaderGradient(plan.color);
  }

  getHeaderGradient(color: string): string {
    const gradients: Record<string, string> = {
      'amber': 'linear-gradient(to right, #fbbf24, #f97316)',
      'blue': 'linear-gradient(to right, #60a5fa, #06b6d4)',
      'purple': 'linear-gradient(to right, #a78bfa, #ec4899)',
      'pink': 'linear-gradient(to right, #f472b6, #fb7185)',
      'teal': 'linear-gradient(to right, #2dd4bf, #10b981)'
    };
    return gradients[color] || gradients['blue'];
  }

  adjustColor(hex: string, percent: number): string {
    // Lighten a hex color by a percentage
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }
}

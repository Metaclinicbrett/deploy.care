import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarePlan } from '../../models/care-plan.model';
import { CarePlanService } from '../../services/care-plan.service';
import { CareTypeBadgeComponent } from '../shared/care-type-badge/care-type-badge.component';
import { PricingBadgeComponent } from '../shared/pricing-badge/pricing-badge.component';
import { RequirementIndicatorsComponent } from '../shared/requirement-indicators/requirement-indicators.component';
import { ExperienceBadgeComponent } from '../experience-badge/experience-badge.component';
import { LocationLogoComponent } from '../location-logo/location-logo.component';

@Component({
  selector: 'app-care-plan-hybrid',
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
    <div class="space-y-4">
      @for (plan of plans; track plan.id) {
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden">
          <!-- Main Row -->
          <div class="p-4 cursor-pointer" (click)="toggleExpanded(plan.id)">
            <div class="flex items-center gap-4">
              <!-- Location Logo -->
              <app-location-logo
                [location]="plan.locationDetails"
                [logoUrl]="plan.logoUrl"
                [providerName]="plan.provider"
                size="lg"
                [showDetails]="false"
              />

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ plan.name }}</h3>
                  <app-care-type-badge [type]="plan.careType" />
                </div>
                <div class="flex items-center gap-3 text-sm mb-2">
                  <span class="text-gray-500 dark:text-gray-400">{{ plan.provider }}</span>
                  @if (getLocationText(plan)) {
                    <span class="text-gray-400 dark:text-gray-500">• {{ getLocationText(plan) }}</span>
                  }
                </div>
                <!-- Experience Types in collapsed view -->
                @if (plan.experienceTypes && plan.experienceTypes.length > 0) {
                  <app-experience-badge
                    [types]="plan.experienceTypes"
                    [showLabel]="false"
                    size="sm"
                  />
                } @else if (plan.experienceType) {
                  <app-experience-badge
                    [type]="plan.experienceType"
                    [showLabel]="false"
                    size="sm"
                  />
                }
              </div>

              <!-- Quick Stats -->
              <div class="hidden md:flex items-center gap-6">
                <div class="text-center">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Dx Codes</div>
                  <div class="font-semibold text-gray-700 dark:text-gray-300">{{ plan.diagnosisCodes.length }}</div>
                </div>
                <div class="text-center">
                  <div class="text-xs text-gray-500 dark:text-gray-400 mb-0.5">CPT</div>
                  <div class="font-semibold text-gray-700 dark:text-gray-300">{{ plan.cptCodes.length }}</div>
                </div>
                <app-requirement-indicators [plan]="plan" [compact]="true" />
              </div>

              <!-- Pricing & Action -->
              <div class="flex items-center gap-4">
                <app-pricing-badge [model]="plan.pricingModel" [price]="plan.price" [unit]="plan.priceUnit" />
                <button
                  (click)="onEnrollClick($event)"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                  Enroll
                </button>
                <svg
                  [class]="'w-5 h-5 text-gray-400 transition-transform ' + (isExpanded(plan.id) ? 'rotate-180' : '')"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Expanded Details -->
          @if (isExpanded(plan.id)) {
            <div class="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 p-5 animate-fade-in">
              <div class="grid md:grid-cols-3 gap-6">
                <!-- Description & Experience Types -->
                <div>
                  <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Description</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">{{ plan.description }}</p>

                  <!-- Full Experience Types with labels -->
                  @if (plan.experienceTypes && plan.experienceTypes.length > 0) {
                    <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Patient Experience</h4>
                    <app-experience-badge
                      [types]="plan.experienceTypes"
                      [showLabel]="true"
                      size="md"
                    />
                  } @else if (plan.experienceType) {
                    <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Patient Experience</h4>
                    <app-experience-badge
                      [type]="plan.experienceType"
                      [showLabel]="true"
                      size="md"
                    />
                  }
                </div>

                <!-- Diagnosis Codes -->
                <div>
                  <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">ICD-10 Diagnosis Codes</h4>
                  <div class="space-y-2">
                    @for (dx of plan.diagnosisCodes; track dx.code) {
                      <div class="flex items-start gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                        <code class="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded font-mono text-sm font-semibold shrink-0">
                          {{ dx.code }}
                        </code>
                        <span class="text-sm text-gray-600 dark:text-gray-300">{{ dx.description }}</span>
                      </div>
                    }
                  </div>
                </div>

                <!-- CPT & Requirements -->
                <div class="space-y-4">
                  <div>
                    <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">CPT Codes</h4>
                    <div class="flex flex-wrap gap-2">
                      @for (cpt of plan.cptCodes; track cpt) {
                        <span class="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-mono text-sm font-medium">
                          {{ cpt }}
                        </span>
                      }
                    </div>
                  </div>

                  <div>
                    <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Requirements</h4>
                    <div class="space-y-2">
                      @if (plan.depositRequired) {
                        <div class="flex items-center gap-2 text-sm">
                          <span class="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">💰</span>
                          <span class="text-gray-600 dark:text-gray-300">\${{ plan.depositAmount }} deposit required</span>
                        </div>
                      }
                      @if (plan.lopRequired) {
                        <div class="flex items-center gap-2 text-sm">
                          <span class="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">📋</span>
                          <span class="text-gray-600 dark:text-gray-300">Letter of Protection required</span>
                        </div>
                      }
                      @if (plan.documentsRequired.length > 0) {
                        <div class="text-sm">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">📄</span>
                            <span class="text-gray-600 dark:text-gray-300">Required documents:</span>
                          </div>
                          <ul class="ml-8 space-y-0.5">
                            @for (doc of plan.documentsRequired; track doc) {
                              <li class="text-gray-500 dark:text-gray-400 text-sm">• {{ doc }}</li>
                            }
                          </ul>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class CarePlanHybridComponent {
  @Input({ required: true }) plans!: CarePlan[];

  private carePlanService = inject(CarePlanService);

  isExpanded(planId: number): boolean {
    return this.carePlanService.expandedPlanId() === planId;
  }

  toggleExpanded(planId: number): void {
    this.carePlanService.toggleExpanded(planId);
  }

  onEnrollClick(event: Event): void {
    event.stopPropagation();
    // Handle enrollment action
  }

  getLocationText(plan: CarePlan): string {
    if (plan.locationDetails?.city) {
      const city = plan.locationDetails.city;
      const state = plan.locationDetails.state;
      return state ? `${city}, ${state}` : city;
    }
    return plan.location || '';
  }
}

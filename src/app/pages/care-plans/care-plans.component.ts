import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterPanelComponent } from '../../components/filter-panel/filter-panel.component';
import { CarePlanListComponent } from '../../components/care-plan-list/care-plan-list.component';
import { CarePlanCardComponent } from '../../components/care-plan-card/care-plan-card.component';
import { CarePlanHybridComponent } from '../../components/care-plan-hybrid/care-plan-hybrid.component';
import { CarePlanService } from '../../services/care-plan.service';

@Component({
  selector: 'app-care-plans',
  standalone: true,
  imports: [
    CommonModule,
    FilterPanelComponent,
    CarePlanListComponent,
    CarePlanCardComponent,
    CarePlanHybridComponent
  ],
  template: `
    <main class="max-w-7xl mx-auto px-4 py-6">
      <!-- Page Title -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-1">Care Plan Enrollment</h1>
        <p class="text-gray-500">Select a care plan to enroll your patient</p>
      </div>

      <!-- Filter Panel -->
      <app-filter-panel />

      <!-- Results Count -->
      <div class="flex items-center justify-between mb-4">
        <p class="text-sm text-gray-500">
          Showing <span class="font-semibold text-gray-700">{{ filteredPlans().length }}</span>
          of {{ totalPlans() }} care plans
        </p>
      </div>

      <!-- View Variations -->
      @switch (currentVariation()) {
        @case ('list') {
          <app-care-plan-list [plans]="filteredPlans()" />
        }
        @case ('card') {
          <app-care-plan-card [plans]="filteredPlans()" />
        }
        @case ('hybrid') {
          <app-care-plan-hybrid [plans]="filteredPlans()" />
        }
      }
    </main>
  `
})
export class CarePlansComponent {
  private carePlanService = inject(CarePlanService);

  get currentVariation() {
    return this.carePlanService.viewVariation;
  }

  get filteredPlans() {
    return this.carePlanService.filteredPlans;
  }

  get totalPlans() {
    return () => this.carePlanService.carePlans().length;
  }
}

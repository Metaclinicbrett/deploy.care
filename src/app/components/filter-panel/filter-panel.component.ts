import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarePlanService } from '../../services/care-plan.service';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-semibold text-gray-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter Care Plans
        </h3>
        <button
          (click)="isExpanded.set(!isExpanded())"
          class="text-sm text-blue-600 hover:text-blue-800 font-medium">
          {{ isExpanded() ? 'Collapse' : 'Expand Filters' }}
        </button>
      </div>

      <!-- Quick Search -->
      <div class="relative mb-4">
        <input
          type="text"
          placeholder="Search by diagnosis code, CPT code, or description..."
          [ngModel]="filters().search"
          (ngModelChange)="updateSearch($event)"
          class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Quick Filter Tags -->
      <div class="flex flex-wrap gap-2 mb-4">
        @for (tag of quickFilterTags; track tag) {
          <button
            (click)="setQuickFilter(tag)"
            [class]="getQuickFilterClass(tag)">
            {{ tag }}
          </button>
        }
      </div>

      <!-- Expanded Filters -->
      @if (isExpanded()) {
        <div class="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 animate-fade-in">
          <!-- ICD-10 Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filter by ICD-10 Code</label>
            <select
              [ngModel]="filters().diagnosisCode"
              (ngModelChange)="updateDiagnosisCode($event)"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
              <option value="">All Diagnosis Codes</option>
              @for (code of allDiagnosisCodes(); track code) {
                <option [value]="code">{{ code }}</option>
              }
            </select>
          </div>

          <!-- CPT Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Filter by CPT Code</label>
            <select
              [ngModel]="filters().cptCode"
              (ngModelChange)="updateCptCode($event)"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
              <option value="">All CPT Codes</option>
              @for (code of allCptCodes(); track code) {
                <option [value]="code">{{ code }}</option>
              }
            </select>
          </div>
        </div>
      }
    </div>
  `
})
export class FilterPanelComponent {
  private carePlanService = inject(CarePlanService);

  isExpanded = signal(false);

  quickFilterTags = ['All', 'DX Only', 'TX Only', 'DX/TX Combo', 'Subscription', 'One-Time'];

  get filters() {
    return this.carePlanService.filters;
  }

  get allDiagnosisCodes() {
    return this.carePlanService.allDiagnosisCodes;
  }

  get allCptCodes() {
    return this.carePlanService.allCptCodes;
  }

  updateSearch(value: string): void {
    this.carePlanService.updateFilters({ search: value });
  }

  setQuickFilter(tag: string): void {
    const current = this.filters().quickFilter;
    this.carePlanService.updateFilters({ quickFilter: current === tag ? 'All' : tag });
  }

  updateDiagnosisCode(value: string): void {
    this.carePlanService.updateFilters({ diagnosisCode: value });
  }

  updateCptCode(value: string): void {
    this.carePlanService.updateFilters({ cptCode: value });
  }

  getQuickFilterClass(tag: string): string {
    const base = 'px-3 py-1.5 rounded-full text-sm font-medium transition';
    return this.filters().quickFilter === tag
      ? `${base} bg-blue-600 text-white`
      : `${base} bg-gray-100 text-gray-600 hover:bg-gray-200`;
  }
}

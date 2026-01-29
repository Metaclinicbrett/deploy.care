import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarePlan } from '../../../models/care-plan.model';

@Component({
  selector: 'app-requirement-indicators',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (compact) {
      <div class="flex gap-1">
        @if (plan.depositRequired) {
          <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-amber-100" title="Deposit Required">
            💰
          </span>
        }
        @if (plan.lopRequired) {
          <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-red-100" title="LOP Required">
            📋
          </span>
        }
        @if (plan.documentsRequired.length > 0) {
          <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-blue-100"
                [title]="plan.documentsRequired.length + ' Documents Required'">
            📄
          </span>
        }
      </div>
    } @else {
      <div class="flex flex-wrap gap-2">
        @if (plan.depositRequired) {
          <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span>💰</span> {{ '$' + plan.depositAmount }} Deposit
          </span>
        }
        @if (plan.lopRequired) {
          <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <span>📋</span> LOP Required
          </span>
        }
        @if (plan.documentsRequired.length > 0) {
          <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <span>📄</span> {{ plan.documentsRequired.length }} Documents
          </span>
        }
      </div>
    }
  `
})
export class RequirementIndicatorsComponent {
  @Input({ required: true }) plan!: CarePlan;
  @Input() compact: boolean = false;
}

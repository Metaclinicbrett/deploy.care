import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingModel } from '../../../models/care-plan.model';

@Component({
  selector: 'app-pricing-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClasses">
      @if (model === 'subscription') {
        <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      } @else {
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
      <span [class]="priceClasses">
        {{ '$' + price + unit }}
      </span>
      <span [class]="labelClasses">
        {{ model === 'subscription' ? 'Subscription' : 'One-time' }}
      </span>
    </div>
  `
})
export class PricingBadgeComponent {
  @Input({ required: true }) model!: PricingModel;
  @Input({ required: true }) price!: number;
  @Input() unit: string = '';

  get containerClasses(): string {
    const base = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg';
    return this.model === 'subscription'
      ? `${base} bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200`
      : `${base} bg-gray-50 border border-gray-200`;
  }

  get priceClasses(): string {
    return this.model === 'subscription'
      ? 'text-sm font-semibold text-purple-700'
      : 'text-sm font-semibold text-gray-700';
  }

  get labelClasses(): string {
    return this.model === 'subscription'
      ? 'text-xs text-purple-500'
      : 'text-xs text-gray-500';
  }
}

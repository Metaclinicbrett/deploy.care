import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CareType } from '../../../models/care-plan.model';

@Component({
  selector: 'app-care-type-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="badgeClasses">
      {{ label }}
    </span>
  `,
  styles: [`
    :host { display: inline-block; }
  `]
})
export class CareTypeBadgeComponent {
  @Input({ required: true }) type!: CareType;

  get badgeClasses(): string {
    const base = 'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border';
    const styles: Record<CareType, string> = {
      'DX': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'TX': 'bg-blue-100 text-blue-700 border-blue-200',
      'DX/TX': 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return `${base} ${styles[this.type]}`;
  }

  get label(): string {
    const labels: Record<CareType, string> = {
      'DX': 'Diagnosis',
      'TX': 'Treatment',
      'DX/TX': 'Dx + Tx'
    };
    return labels[this.type];
  }
}

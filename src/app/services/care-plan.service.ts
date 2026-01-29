import { Injectable, signal, computed } from '@angular/core';
import { CarePlan, CarePlanFilters, ViewVariation } from '../models/care-plan.model';

@Injectable({
  providedIn: 'root'
})
export class CarePlanService {
  // State signals
  readonly viewVariation = signal<ViewVariation>('list');
  readonly filters = signal<CarePlanFilters>({
    search: '',
    quickFilter: 'All',
    diagnosisCode: '',
    cptCode: '',
    depositRequired: false,
    lopRequired: false,
    docsRequired: false
  });
  readonly expandedPlanId = signal<number | null>(null);

  // Sample data with patient experience types
  readonly carePlans = signal<CarePlan[]>([
    {
      id: 1,
      name: 'DaylightRx',
      provider: 'Big Health',
      location: null,
      type: 'Telemedicine',
      description: 'SleepioRx1 and DaylightRx2 are FDA-cleared digital treatments for insomnia disorder and generalized anxiety disorder.',
      diagnosisCodes: [
        { code: 'F51.01', description: 'Primary insomnia' },
        { code: 'F41.1', description: 'Generalized anxiety disorder' },
        { code: 'G47.00', description: 'Insomnia, unspecified' }
      ],
      cptCodes: ['98975', '98976', '98977'],
      careType: 'TX',
      pricingModel: 'subscription',
      price: 49,
      priceUnit: '/month',
      depositRequired: false,
      lopRequired: false,
      documentsRequired: ['Patient consent form'],
      color: 'amber',
      experienceType: 'therapy',
      experienceTypes: ['therapy', 'telemedicine'],
      logoUrl: '/assets/logos/big-health.png',
      locationDetails: {
        id: 'bh-1',
        name: 'Big Health HQ',
        city: 'San Francisco',
        state: 'CA',
        brandColor: '#F59E0B'
      }
    },
    {
      id: 2,
      name: 'Report Review',
      provider: 'Neuroglympse',
      location: 'Telemedicine, LA',
      type: 'Telemedicine',
      description: 'Neuroglympse Care team reviews the patient\'s final report to discuss any questions or concerns.',
      diagnosisCodes: [
        { code: 'S06.0X0A', description: 'Concussion without LOC, initial' },
        { code: 'F07.81', description: 'Postconcussional syndrome' }
      ],
      cptCodes: ['99213', '99214'],
      careType: 'DX',
      pricingModel: 'one-time',
      price: 150,
      priceUnit: '',
      depositRequired: false,
      lopRequired: false,
      documentsRequired: ['Assessment results', 'Medical history'],
      color: 'blue',
      experienceType: 'telemedicine',
      experienceTypes: ['telemedicine', 'test'],
      logoUrl: '/assets/logos/neuroglympse.png',
      locationDetails: {
        id: 'ng-la',
        name: 'Neuroglympse Los Angeles',
        city: 'Los Angeles',
        state: 'CA',
        brandColor: '#3B82F6'
      }
    },
    {
      id: 3,
      name: '+ New Patient TeleNeurology',
      provider: 'Neuroglympse',
      location: 'Telemedicine, LA',
      type: 'Telemedicine',
      description: 'Objective mild traumatic brain injury (mTBI) evaluation with comprehensive neurological assessment.',
      diagnosisCodes: [
        { code: 'S06.0X1A', description: 'Concussion with LOC <30 min' },
        { code: 'S06.0X0A', description: 'Concussion without LOC, initial' },
        { code: 'F07.81', description: 'Postconcussional syndrome' },
        { code: 'R51.9', description: 'Headache, unspecified' }
      ],
      cptCodes: ['99205', '99215', '96132'],
      careType: 'DX/TX',
      pricingModel: 'one-time',
      price: 495,
      priceUnit: '',
      depositRequired: true,
      depositAmount: 150,
      lopRequired: true,
      documentsRequired: ['ID verification', 'Insurance card', 'Prior medical records', 'Signed LOP'],
      color: 'purple',
      experienceType: 'test',
      experienceTypes: ['test', 'telemedicine'],
      logoUrl: '/assets/logos/neuroglympse.png',
      locationDetails: {
        id: 'ng-la',
        name: 'Neuroglympse Los Angeles',
        city: 'Los Angeles',
        state: 'CA',
        brandColor: '#8B5CF6'
      }
    },
    {
      id: 4,
      name: 'Vagus Nerve Stimulation (VNS)',
      provider: 'Neuroglympse',
      location: 'Telemedicine, LA',
      type: 'Telemedicine',
      description: 'The care plan for Vagus Nerve Stimulation (VNS) in the treatment of Mild Traumatic Brain Injury (mTBI) is focused on reducing symptoms.',
      diagnosisCodes: [
        { code: 'S06.0X1A', description: 'Concussion with LOC <30 min' },
        { code: 'G43.909', description: 'Migraine, unspecified' },
        { code: 'F07.81', description: 'Postconcussional syndrome' }
      ],
      cptCodes: ['64568', '95970', '95971'],
      careType: 'TX',
      pricingModel: 'subscription',
      price: 299,
      priceUnit: '/month',
      depositRequired: true,
      depositAmount: 500,
      lopRequired: true,
      documentsRequired: ['Medical clearance', 'Signed consent', 'Insurance authorization'],
      color: 'pink',
      experienceType: 'electroceutical',
      experienceTypes: ['electroceutical', 'medical_device'],
      logoUrl: '/assets/logos/neuroglympse.png',
      locationDetails: {
        id: 'ng-la',
        name: 'Neuroglympse Los Angeles',
        city: 'Los Angeles',
        state: 'CA',
        brandColor: '#EC4899'
      }
    },
    {
      id: 5,
      name: 'Remote Patient Monitoring - mTBI',
      provider: 'Neuroglympse',
      location: 'Telemedicine',
      type: 'Telemedicine',
      description: 'A cohesive platform that facilitates effective communication between your healthcare team, ensuring that every aspect of your care is harmonized.',
      diagnosisCodes: [
        { code: 'S06.0X0A', description: 'Concussion without LOC, initial' },
        { code: 'Z87.820', description: 'Personal history of TBI' }
      ],
      cptCodes: ['99453', '99454', '99457', '99458'],
      careType: 'TX',
      pricingModel: 'subscription',
      price: 89,
      priceUnit: '/month',
      depositRequired: false,
      lopRequired: false,
      documentsRequired: ['Device agreement', 'HIPAA consent'],
      color: 'teal',
      experienceType: 'wearable',
      experienceTypes: ['wearable', 'medical_device', 'telemedicine'],
      logoUrl: '/assets/logos/neuroglympse.png',
      locationDetails: {
        id: 'ng-remote',
        name: 'Neuroglympse Remote Care',
        city: 'Nationwide',
        state: '',
        brandColor: '#14B8A6'
      }
    }
  ]);

  // Computed values
  readonly allDiagnosisCodes = computed(() => {
    const codes = new Set<string>();
    this.carePlans().forEach(plan => {
      plan.diagnosisCodes.forEach(dx => codes.add(dx.code));
    });
    return Array.from(codes).sort();
  });

  readonly allCptCodes = computed(() => {
    const codes = new Set<string>();
    this.carePlans().forEach(plan => {
      plan.cptCodes.forEach(cpt => codes.add(cpt));
    });
    return Array.from(codes).sort();
  });

  readonly filteredPlans = computed(() => {
    const filters = this.filters();
    return this.carePlans().filter(plan => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesName = plan.name.toLowerCase().includes(search);
        const matchesDesc = plan.description.toLowerCase().includes(search);
        const matchesDx = plan.diagnosisCodes.some(dx =>
          dx.code.toLowerCase().includes(search) || dx.description.toLowerCase().includes(search)
        );
        const matchesCpt = plan.cptCodes.some(cpt => cpt.includes(search));
        if (!matchesName && !matchesDesc && !matchesDx && !matchesCpt) return false;
      }

      // Quick filter
      if (filters.quickFilter !== 'All') {
        if (filters.quickFilter === 'DX Only' && plan.careType !== 'DX') return false;
        if (filters.quickFilter === 'TX Only' && plan.careType !== 'TX') return false;
        if (filters.quickFilter === 'DX/TX Combo' && plan.careType !== 'DX/TX') return false;
        if (filters.quickFilter === 'Subscription' && plan.pricingModel !== 'subscription') return false;
        if (filters.quickFilter === 'One-Time' && plan.pricingModel !== 'one-time') return false;
      }

      // Diagnosis code filter
      if (filters.diagnosisCode && !plan.diagnosisCodes.some(dx => dx.code === filters.diagnosisCode)) return false;

      // CPT code filter
      if (filters.cptCode && !plan.cptCodes.includes(filters.cptCode)) return false;

      return true;
    });
  });

  // Actions
  updateFilters(partial: Partial<CarePlanFilters>): void {
    this.filters.update(current => ({ ...current, ...partial }));
  }

  setViewVariation(variation: ViewVariation): void {
    this.viewVariation.set(variation);
  }

  toggleExpanded(planId: number): void {
    this.expandedPlanId.update(current => current === planId ? null : planId);
  }

  resetFilters(): void {
    this.filters.set({
      search: '',
      quickFilter: 'All',
      diagnosisCode: '',
      cptCode: '',
      depositRequired: false,
      lopRequired: false,
      docsRequired: false
    });
  }
}

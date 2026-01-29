import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Service {
  id: string;
  abbrev: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  features: string[];
  stats: { value: string; label: string }[];
  cptCodes?: string[];
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950">
      <!-- Hero -->
      <section class="relative overflow-hidden py-24 lg:py-32">
        <!-- Dynamic Background -->
        <div class="absolute inset-0">
          <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950"></div>
          <!-- Animated Grid -->
          <div class="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]"></div>
        </div>

        <!-- Floating Icons -->
        <div class="absolute top-20 left-[10%] text-4xl opacity-20 animate-bounce" style="animation-delay: 0s">❤️</div>
        <div class="absolute top-32 right-[15%] text-3xl opacity-20 animate-bounce" style="animation-delay: 0.5s">🧠</div>
        <div class="absolute top-48 left-[25%] text-3xl opacity-20 animate-bounce" style="animation-delay: 1s">📊</div>
        <div class="absolute bottom-32 right-[20%] text-4xl opacity-20 animate-bounce" style="animation-delay: 1.5s">💊</div>
        <div class="absolute bottom-20 left-[30%] text-3xl opacity-20 animate-bounce" style="animation-delay: 2s">🔬</div>

        <div class="relative max-w-7xl mx-auto px-6 text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium mb-8">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            What's Possible Today
          </div>

          <h1 class="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            The Future of Care<br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
              Working Together
            </span>
          </h1>

          <p class="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
            RPM, CCM, PCM, TCM, CBT—and a new generation of dispensable apps.
            At deploy.care, we're not talking about what's coming. We're deploying what's possible <em class="text-white">now</em>.
          </p>

          <!-- Service Pills -->
          <div class="flex flex-wrap justify-center gap-3">
            @for (service of services; track service.id) {
              <button
                (click)="selectService(service.id)"
                class="px-4 py-2 rounded-full text-sm font-medium transition-all"
                [class.bg-indigo-600]="selectedService() === service.id"
                [class.text-white]="selectedService() === service.id"
                [class.bg-slate-800]="selectedService() !== service.id"
                [class.text-slate-400]="selectedService() !== service.id"
                [class.hover:bg-slate-700]="selectedService() !== service.id"
              >
                {{ service.abbrev }}
              </button>
            }
          </div>
        </div>
      </section>

      <!-- Services Grid -->
      <section class="py-16">
        <div class="max-w-7xl mx-auto px-6">
          <div class="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            @for (service of services; track service.id) {
              <div
                class="group relative cursor-pointer"
                (click)="selectService(service.id)"
                [id]="service.id"
              >
                <!-- Glow Effect -->
                <div
                  class="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"
                  [ngClass]="service.gradient"
                ></div>

                <div
                  class="relative bg-slate-900 rounded-2xl border border-slate-800 p-8 h-full transition-all duration-300"
                  [ngClass]="selectedService() === service.id ? 'border-indigo-500 ring-2 ring-indigo-500/50' : ''"
                >
                  <!-- Header -->
                  <div class="flex items-start justify-between mb-6">
                    <div
                      class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      [ngClass]="service.color"
                    >
                      {{ service.icon }}
                    </div>
                    <div class="px-3 py-1 bg-slate-800 rounded-full text-xs font-bold text-slate-400">
                      {{ service.abbrev }}
                    </div>
                  </div>

                  <!-- Content -->
                  <h3 class="text-xl font-bold text-white mb-2">{{ service.name }}</h3>
                  <p class="text-indigo-400 text-sm mb-4">{{ service.tagline }}</p>
                  <p class="text-slate-400 text-sm leading-relaxed mb-6">{{ service.description }}</p>

                  <!-- Features -->
                  <div class="space-y-2 mb-6">
                    @for (feature of service.features.slice(0, 3); track feature) {
                      <div class="flex items-center gap-2 text-sm text-slate-300">
                        <svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        {{ feature }}
                      </div>
                    }
                  </div>

                  <!-- Stats -->
                  <div class="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800">
                    @for (stat of service.stats; track stat.label) {
                      <div class="text-center">
                        <div class="text-lg font-bold text-white">{{ stat.value }}</div>
                        <div class="text-xs text-slate-500">{{ stat.label }}</div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Integration Diagram -->
      <section class="py-24 bg-slate-900/50 overflow-hidden">
        <div class="max-w-6xl mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">
              Everything Working <span class="text-cyan-400">Together</span>
            </h2>
            <p class="text-slate-400 max-w-2xl mx-auto">
              The magic is not in any single service - it is in how they connect.
              Patient data flows seamlessly, triggering the right intervention at the right time.
            </p>
          </div>

          <!-- Visual Diagram -->
          <div class="relative">
            <!-- Center Hub -->
            <div class="flex items-center justify-center">
              <div class="relative">
                <!-- Orbital Rings -->
                <div class="absolute inset-0 w-96 h-96 -m-24 border border-indigo-500/20 rounded-full animate-spin" style="animation-duration: 20s"></div>
                <div class="absolute inset-0 w-80 h-80 -m-16 border border-purple-500/20 rounded-full animate-spin" style="animation-duration: 15s; animation-direction: reverse"></div>
                <div class="absolute inset-0 w-64 h-64 -m-8 border border-cyan-500/20 rounded-full animate-spin" style="animation-duration: 10s"></div>

                <!-- Center Logo -->
                <div class="relative w-48 h-48 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                  <div class="text-center">
                    <div class="text-4xl mb-2">💊</div>
                    <div class="text-white font-bold">deploy.care</div>
                    <div class="text-indigo-200 text-xs">Unified Platform</div>
                  </div>
                </div>

                <!-- Orbiting Services -->
                @for (orb of orbitingServices; track orb.abbrev; let i = $index) {
                  <div
                    class="absolute w-16 h-16 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                    [ngClass]="orb.bg"
                    [style.top]="orb.top"
                    [style.left]="orb.left"
                    [style.transform]="'translate(-50%, -50%)'"
                  >
                    {{ orb.icon }}
                  </div>
                }
              </div>
            </div>

            <!-- Connection Lines Description -->
            <div class="grid md:grid-cols-3 gap-8 mt-16">
              @for (flow of dataFlows; track flow.title) {
                <div class="bg-slate-900 rounded-xl p-6 border border-slate-800">
                  <div class="w-10 h-10 rounded-lg mb-4 flex items-center justify-center" [ngClass]="flow.color">
                    <span class="text-xl">{{ flow.icon }}</span>
                  </div>
                  <h4 class="font-semibold text-white mb-2">{{ flow.title }}</h4>
                  <p class="text-sm text-slate-400">{{ flow.description }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Dispensable Apps -->
      <section class="py-24">
        <div class="max-w-7xl mx-auto px-6">
          <div class="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-400 text-sm font-medium mb-6">
                <span class="text-lg">✨</span>
                New Generation
              </div>

              <h2 class="text-3xl lg:text-4xl font-bold text-white mb-6">
                Dispensable Apps:<br/>
                <span class="text-pink-400">Care at the Point of Need</span>
              </h2>

              <p class="text-slate-400 text-lg leading-relaxed mb-8">
                Beyond traditional monitoring, we're pioneering micro-interventions
                delivered exactly when and where they're needed. Prescription-grade
                digital therapeutics that patients can "dispense" themselves.
              </p>

              <div class="space-y-4 mb-8">
                @for (app of dispensableApps; track app.name) {
                  <div class="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" [ngClass]="app.color">
                      {{ app.icon }}
                    </div>
                    <div>
                      <h4 class="font-semibold text-white">{{ app.name }}</h4>
                      <p class="text-sm text-slate-400">{{ app.description }}</p>
                    </div>
                  </div>
                }
              </div>

              <a routerLink="/dispensable" class="inline-flex items-center gap-2 text-pink-400 font-medium hover:text-pink-300 transition-colors">
                Explore Dispensable Apps
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>
            </div>

            <!-- Phone Mockup -->
            <div class="relative flex justify-center">
              <div class="relative">
                <!-- Glow -->
                <div class="absolute -inset-8 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-[60px] blur-3xl"></div>

                <!-- Phone Frame -->
                <div class="relative w-72 bg-slate-900 rounded-[40px] border-4 border-slate-700 p-3 shadow-2xl">
                  <!-- Notch -->
                  <div class="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-700 rounded-full"></div>

                  <!-- Screen -->
                  <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[28px] overflow-hidden">
                    <!-- Status Bar -->
                    <div class="h-12 flex items-center justify-between px-6 pt-2">
                      <span class="text-white text-xs font-medium">9:41</span>
                      <div class="flex items-center gap-1">
                        <div class="w-4 h-2 border border-white/50 rounded-sm"><div class="w-3 h-1 bg-emerald-400 rounded-sm m-px"></div></div>
                      </div>
                    </div>

                    <!-- App Content -->
                    <div class="px-6 py-4">
                      <div class="text-center mb-6">
                        <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-3xl mb-3">
                          🧘
                        </div>
                        <h3 class="text-white font-semibold">Calm Session</h3>
                        <p class="text-slate-400 text-xs">Prescribed by Dr. Chen</p>
                      </div>

                      <div class="space-y-3">
                        <div class="bg-slate-800/50 rounded-xl p-4">
                          <div class="flex items-center justify-between mb-2">
                            <span class="text-sm text-slate-300">Today's Progress</span>
                            <span class="text-emerald-400 text-sm font-medium">2/3</span>
                          </div>
                          <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div class="h-full w-2/3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"></div>
                          </div>
                        </div>

                        <button class="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl">
                          Start Session
                        </button>
                      </div>
                    </div>

                    <!-- Bottom Space -->
                    <div class="h-8"></div>
                  </div>

                  <!-- Home Indicator -->
                  <div class="flex justify-center pt-2">
                    <div class="w-32 h-1 bg-slate-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="py-24 bg-gradient-to-br from-cyan-600 via-indigo-600 to-purple-600">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Deploy Better Care?
          </h2>
          <p class="text-cyan-100 text-lg mb-10 max-w-2xl mx-auto">
            Don't wait for the future. The infrastructure is built, the integrations
            are ready, and the outcomes speak for themselves.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/contact" class="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-cyan-50 transition-all">
              Schedule a Demo
            </a>
            <a routerLink="/pricing" class="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all">
              View Pricing
            </a>
          </div>
        </div>
      </section>
    </div>
  `
})
export class ServicesComponent {
  selectedService = signal('rpm');

  services: Service[] = [
    {
      id: 'rpm',
      abbrev: 'RPM',
      name: 'Remote Patient Monitoring',
      tagline: 'Continuous visibility into patient health',
      description: 'Real-time monitoring of vital signs, symptoms, and health data through connected devices. Proactive care that catches problems before they become emergencies.',
      icon: '❤️',
      color: 'bg-red-500/20',
      gradient: 'bg-gradient-to-r from-red-500/30 to-orange-500/30',
      features: [
        '50+ device integrations',
        'AI-powered anomaly detection',
        'Automated alert escalation',
        'Patient engagement tools',
        'Telehealth integration'
      ],
      stats: [
        { value: '38%', label: 'ER Reduction' },
        { value: '99.7%', label: 'Uptime' },
        { value: '24/7', label: 'Monitoring' }
      ],
      cptCodes: ['99453', '99454', '99457', '99458']
    },
    {
      id: 'ccm',
      abbrev: 'CCM',
      name: 'Chronic Care Management',
      tagline: 'Coordinated care for complex patients',
      description: 'Comprehensive care coordination for patients with two or more chronic conditions. Monthly touchpoints, care planning, and medication management that keeps patients on track.',
      icon: '📋',
      color: 'bg-indigo-500/20',
      gradient: 'bg-gradient-to-r from-indigo-500/30 to-blue-500/30',
      features: [
        'Personalized care plans',
        'Medication reconciliation',
        'Care team coordination',
        'Patient education',
        'Goal tracking'
      ],
      stats: [
        { value: '42%', label: 'Better Outcomes' },
        { value: '4.8', label: 'Patient Rating' },
        { value: '$847', label: 'Savings/Patient' }
      ],
      cptCodes: ['99490', '99491', '99437', '99439']
    },
    {
      id: 'pcm',
      abbrev: 'PCM',
      name: 'Principal Care Management',
      tagline: 'Focused management for single conditions',
      description: 'Intensive management for patients with a single high-risk chronic condition. Deep expertise and focused attention that drives measurable improvement.',
      icon: '🎯',
      color: 'bg-purple-500/20',
      gradient: 'bg-gradient-to-r from-purple-500/30 to-pink-500/30',
      features: [
        'Condition-specific protocols',
        'Specialist coordination',
        'Outcome tracking',
        'Risk stratification',
        'Intervention triggers'
      ],
      stats: [
        { value: '56%', label: 'Goal Achievement' },
        { value: '23%', label: 'Cost Reduction' },
        { value: '89%', label: 'Engagement' }
      ],
      cptCodes: ['99424', '99425', '99426', '99427']
    },
    {
      id: 'tcm',
      abbrev: 'TCM',
      name: 'Transitional Care Management',
      tagline: '30 days of critical post-discharge care',
      description: 'Intensive support during the vulnerable period after hospital discharge. Medication review, follow-up scheduling, and care coordination that prevents readmissions.',
      icon: '🔄',
      color: 'bg-cyan-500/20',
      gradient: 'bg-gradient-to-r from-cyan-500/30 to-teal-500/30',
      features: [
        '24-hour post-discharge contact',
        'Medication reconciliation',
        'Follow-up scheduling',
        'Care barrier resolution',
        'Readmission prevention'
      ],
      stats: [
        { value: '31%', label: 'Readmit Reduction' },
        { value: '48hr', label: 'Contact Time' },
        { value: '92%', label: 'Completion Rate' }
      ],
      cptCodes: ['99495', '99496']
    },
    {
      id: 'cbt',
      abbrev: 'CBT',
      name: 'Cognitive Behavioral Therapy',
      tagline: 'Evidence-based behavioral health',
      description: 'Structured CBT protocols delivered through our platform. Digital therapeutics that complement traditional therapy with 24/7 access to coping tools and exercises.',
      icon: '🧠',
      color: 'bg-emerald-500/20',
      gradient: 'bg-gradient-to-r from-emerald-500/30 to-green-500/30',
      features: [
        'PHQ-9 & GAD-7 integration',
        'Therapist-guided modules',
        'Progress tracking',
        'Crisis intervention',
        'Habit formation tools'
      ],
      stats: [
        { value: '67%', label: 'Symptom Reduction' },
        { value: '8wk', label: 'Avg. Program' },
        { value: '4.9', label: 'Patient Rating' }
      ]
    },
    {
      id: 'bhm',
      abbrev: 'BHM',
      name: 'Behavioral Health Management',
      tagline: 'Integrated mental health support',
      description: 'Comprehensive behavioral health management integrated with primary care. Screening, referral, and ongoing support that addresses the whole person.',
      icon: '🌱',
      color: 'bg-pink-500/20',
      gradient: 'bg-gradient-to-r from-pink-500/30 to-rose-500/30',
      features: [
        'Universal screening',
        'Collaborative care model',
        'Therapy matching',
        'Medication management',
        'Crisis support'
      ],
      stats: [
        { value: '78%', label: 'Engagement Rate' },
        { value: '45%', label: 'Improvement' },
        { value: '3.2x', label: 'ROI' }
      ]
    }
  ];

  orbitingServices = [
    { abbrev: 'RPM', icon: '❤️', bg: 'bg-red-500', top: '-20%', left: '50%' },
    { abbrev: 'CCM', icon: '📋', bg: 'bg-indigo-500', top: '15%', left: '90%' },
    { abbrev: 'PCM', icon: '🎯', bg: 'bg-purple-500', top: '65%', left: '95%' },
    { abbrev: 'TCM', icon: '🔄', bg: 'bg-cyan-500', top: '95%', left: '60%' },
    { abbrev: 'CBT', icon: '🧠', bg: 'bg-emerald-500', top: '80%', left: '10%' },
    { abbrev: 'BHM', icon: '🌱', bg: 'bg-pink-500', top: '30%', left: '5%' }
  ];

  dataFlows = [
    {
      icon: '📡',
      color: 'bg-cyan-500/20',
      title: 'Real-Time Data',
      description: 'Device readings, assessments, and patient-reported outcomes flow continuously into the platform.'
    },
    {
      icon: '🤖',
      color: 'bg-purple-500/20',
      title: 'AI Orchestration',
      description: 'Machine learning determines which service should engage based on patient state and risk factors.'
    },
    {
      icon: '🎯',
      color: 'bg-emerald-500/20',
      title: 'Targeted Intervention',
      description: 'The right care team member is alerted with the right context to take immediate action.'
    }
  ];

  dispensableApps = [
    {
      name: 'Calm Session',
      icon: '🧘',
      color: 'bg-purple-500/20',
      description: 'On-demand anxiety management with guided breathing and grounding exercises.'
    },
    {
      name: 'Pain Tracker',
      icon: '📊',
      color: 'bg-red-500/20',
      description: 'AI-powered pain journaling that identifies triggers and patterns.'
    },
    {
      name: 'Sleep Reset',
      icon: '🌙',
      color: 'bg-indigo-500/20',
      description: 'CBT-I protocols delivered in bite-sized evening sessions.'
    },
    {
      name: 'Mood Boost',
      icon: '☀️',
      color: 'bg-amber-500/20',
      description: 'Behavioral activation exercises personalized to patient interests.'
    }
  ];

  selectService(id: string) {
    this.selectedService.set(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

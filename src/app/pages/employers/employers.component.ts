import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-employers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <!-- Hero Section -->
      <section class="relative overflow-hidden">
        <!-- Animated Background -->
        <div class="absolute inset-0">
          <div class="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div class="absolute top-40 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
          <div class="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s"></div>
        </div>

        <div class="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div class="text-center max-w-4xl mx-auto">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-8">
              <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              For Forward-Thinking Employers
            </div>

            <h1 class="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Reward <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400">Better Outcomes</span>
            </h1>

            <p class="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Partner with physicians who are answering the call. Value-based care isn't the future—it's happening now with deploy.care.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a routerLink="/contact" class="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
                Partner With Us
              </a>
              <a routerLink="/demo" class="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                See Platform Demo
              </a>
            </div>
          </div>
        </div>

        <!-- Stats Bar -->
        <div class="relative max-w-5xl mx-auto px-6 pb-20">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
            @for (stat of stats; track stat.label) {
              <div class="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div class="text-3xl lg:text-4xl font-bold text-white mb-2">{{ stat.value }}</div>
                <div class="text-slate-400 text-sm">{{ stat.label }}</div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Value Proposition -->
      <section class="py-24 bg-slate-900/50">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">The Outcomes Revolution</h2>
            <p class="text-slate-400 max-w-2xl mx-auto">Transform your healthcare spend from a cost center to a competitive advantage</p>
          </div>

          <div class="grid lg:grid-cols-3 gap-8">
            @for (card of valueCards; track card.title) {
              <div class="group relative">
                <div class="absolute inset-0 bg-gradient-to-r rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" [ngClass]="card.gradient"></div>
                <div class="relative p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 group-hover:border-transparent transition-all h-full">
                  <div class="w-14 h-14 rounded-xl flex items-center justify-center mb-6" [ngClass]="card.iconBg">
                    <span class="text-3xl">{{ card.icon }}</span>
                  </div>
                  <h3 class="text-xl font-semibold text-white mb-3">{{ card.title }}</h3>
                  <p class="text-slate-400 leading-relaxed">{{ card.description }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Physicians Section -->
      <section class="py-24 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-cyan-900/20"></div>

        <div class="relative max-w-7xl mx-auto px-6">
          <div class="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 class="text-3xl lg:text-4xl font-bold text-white mb-6">
                Physicians Answering<br/>
                <span class="text-emerald-400">The Call</span>
              </h2>
              <p class="text-slate-300 text-lg mb-8 leading-relaxed">
                The best doctors aren't just treating symptoms—they're transforming lives.
                Deploy.care empowers physicians to deliver measurable outcomes while being
                fairly compensated for the value they create.
              </p>

              <div class="space-y-4">
                @for (benefit of physicianBenefits; track benefit) {
                  <div class="flex items-start gap-4">
                    <div class="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span class="text-slate-300">{{ benefit }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Physician Cards -->
            <div class="relative">
              <div class="grid grid-cols-2 gap-4">
                @for (doc of featuredDoctors; track doc.name; let i = $index) {
                  <div
                    class="p-6 bg-gradient-to-br rounded-2xl border border-white/10"
                    [ngClass]="{
                      'from-emerald-900/40 to-slate-900': i % 2 === 0,
                      'from-cyan-900/40 to-slate-900': i % 2 === 1,
                      'col-span-2': i === 2
                    }"
                  >
                    <div class="flex items-center gap-4 mb-4">
                      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                        {{ doc.initials }}
                      </div>
                      <div>
                        <div class="font-semibold text-white">{{ doc.name }}</div>
                        <div class="text-sm text-slate-400">{{ doc.specialty }}</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                      </svg>
                      {{ doc.metric }}
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works -->
      <section class="py-24 bg-slate-900">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p class="text-slate-400">A simple framework for outcome-based partnerships</p>
          </div>

          <div class="grid lg:grid-cols-4 gap-8">
            @for (step of steps; track step.num; let i = $index) {
              <div class="relative">
                @if (i < steps.length - 1) {
                  <div class="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
                }
                <div class="text-center">
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                    {{ step.num }}
                  </div>
                  <h3 class="text-lg font-semibold text-white mb-2">{{ step.title }}</h3>
                  <p class="text-slate-400 text-sm">{{ step.description }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- ROI Calculator Preview -->
      <section class="py-24 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-slate-900 to-emerald-900/30"></div>

        <div class="relative max-w-4xl mx-auto px-6 text-center">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-6">
            Calculate Your <span class="text-emerald-400">ROI</span>
          </h2>
          <p class="text-slate-300 mb-10 max-w-2xl mx-auto">
            Employers partnering with deploy.care see an average of 23% reduction in healthcare costs
            while improving employee satisfaction and health outcomes.
          </p>

          <div class="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700 p-8 lg:p-12">
            <div class="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div class="text-4xl font-bold text-emerald-400 mb-2">$2.4M</div>
                <div class="text-slate-400">Avg. Annual Savings</div>
              </div>
              <div>
                <div class="text-4xl font-bold text-cyan-400 mb-2">31%</div>
                <div class="text-slate-400">Reduced ER Visits</div>
              </div>
              <div>
                <div class="text-4xl font-bold text-purple-400 mb-2">4.8x</div>
                <div class="text-slate-400">Return on Investment</div>
              </div>
            </div>

            <a routerLink="/calculator" class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all">
              Build Your Business Case
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-24 bg-gradient-to-r from-emerald-600 to-cyan-600">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Healthcare Outcomes?
          </h2>
          <p class="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto">
            Join the employers who are already seeing measurable results.
            Your workforce deserves better—and now it's possible.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/contact" class="px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-all">
              Schedule a Consultation
            </a>
            <a routerLink="/case-studies" class="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all">
              View Case Studies
            </a>
          </div>
        </div>
      </section>
    </div>
  `
})
export class EmployersComponent {
  stats = [
    { value: '94%', label: 'Employee Satisfaction' },
    { value: '$847', label: 'Avg. Savings/Employee' },
    { value: '2.3x', label: 'Better Outcomes' },
    { value: '156', label: 'Partner Employers' }
  ];

  valueCards = [
    {
      icon: '💰',
      iconBg: 'bg-emerald-500/20',
      gradient: 'from-emerald-500/20 to-transparent',
      title: 'Pay for Value, Not Volume',
      description: 'Shift from fee-for-service to outcome-based compensation. Reward physicians who keep your employees healthy, not just those who see them frequently.'
    },
    {
      icon: '📊',
      iconBg: 'bg-cyan-500/20',
      gradient: 'from-cyan-500/20 to-transparent',
      title: 'Measurable Results',
      description: 'Real-time dashboards track health outcomes, engagement metrics, and cost savings. Know exactly what you\'re getting for your healthcare investment.'
    },
    {
      icon: '🎯',
      iconBg: 'bg-purple-500/20',
      gradient: 'from-purple-500/20 to-transparent',
      title: 'Aligned Incentives',
      description: 'When doctors succeed in improving outcomes, everyone wins. Create partnerships where physician success directly correlates with employee wellness.'
    }
  ];

  physicianBenefits = [
    'Dedicated time for complex cases without volume pressure',
    'Fair compensation tied to patient improvement metrics',
    'Advanced tools for remote monitoring and intervention',
    'Care coordination support across specialties',
    'Direct communication channels with engaged employers'
  ];

  featuredDoctors = [
    { name: 'Dr. Sarah Chen', specialty: 'Endocrinology', initials: 'SC', metric: '45% A1C improvement rate' },
    { name: 'Dr. Marcus Johnson', specialty: 'Cardiology', initials: 'MJ', metric: '38% reduced readmissions' },
    { name: 'Dr. Emily Rodriguez', specialty: 'Primary Care', initials: 'ER', metric: '92% patient engagement' }
  ];

  steps = [
    { num: '1', title: 'Define Outcomes', description: 'Identify the health metrics that matter most for your workforce' },
    { num: '2', title: 'Match Physicians', description: 'Connect with doctors committed to delivering measurable results' },
    { num: '3', title: 'Track Progress', description: 'Monitor real-time dashboards showing outcomes and engagement' },
    { num: '4', title: 'Reward Success', description: 'Compensate based on actual health improvements delivered' }
  ];
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950">
      <!-- Navigation -->
      <nav class="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex items-center justify-between">
            <!-- Logo -->
            <a routerLink="/" class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <span class="text-xl font-semibold text-white">
                deploy<span class="text-indigo-400">.care</span>
              </span>
            </a>

            <!-- Nav Links -->
            <div class="hidden md:flex items-center gap-8">
              <a routerLink="/services" class="text-slate-300 hover:text-white transition-colors">Services</a>
              <a routerLink="/employers" class="text-slate-300 hover:text-white transition-colors">For Employers</a>
              <a routerLink="/our-story" class="text-slate-300 hover:text-white transition-colors">Our Story</a>
            </div>

            <!-- CTA Buttons -->
            <div class="flex items-center gap-4">
              <a routerLink="/login" class="text-slate-300 hover:text-white transition-colors">Sign In</a>
              <a routerLink="/login" class="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="relative pt-32 pb-24 overflow-hidden">
        <!-- Background Effects -->
        <div class="absolute inset-0">
          <div class="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
          <div class="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]"></div>
          <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        </div>

        <div class="relative max-w-7xl mx-auto px-6">
          <div class="max-w-4xl mx-auto text-center">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium mb-8">
              <span class="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
              Now out of stealth
            </div>

            <h1 class="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              The Backend of Our<br/>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Wellness Future
              </span>
            </h1>

            <p class="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              RPM, CCM, PCM, TCM, CBT—and a new generation of care apps.
              We built the infrastructure. Now we're deploying better outcomes.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <a routerLink="/login" class="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                Start Free Trial
              </a>
              <a routerLink="/services" class="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                Explore Services
              </a>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              @for (stat of stats; track stat.label) {
                <div class="text-center">
                  <div class="text-3xl font-bold text-white mb-1">{{ stat.value }}</div>
                  <div class="text-sm text-slate-500">{{ stat.label }}</div>
                </div>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Services Preview -->
      <section class="py-24 bg-slate-900/50">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">Everything Working Together</h2>
            <p class="text-slate-400 max-w-2xl mx-auto">
              From remote monitoring to behavioral health, our integrated platform
              delivers coordinated care at every touchpoint.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (service of services; track service.abbrev) {
              <div class="group p-6 bg-slate-900 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition-all">
                <div class="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-2xl" [ngClass]="service.color">
                  {{ service.icon }}
                </div>
                <div class="text-xs font-bold text-slate-500 mb-2">{{ service.abbrev }}</div>
                <h3 class="text-lg font-semibold text-white mb-2">{{ service.name }}</h3>
                <p class="text-sm text-slate-400">{{ service.description }}</p>
              </div>
            }
          </div>

          <div class="text-center mt-12">
            <a routerLink="/services" class="inline-flex items-center gap-2 text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
              View All Services
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      <!-- For Employers -->
      <section class="py-24">
        <div class="max-w-7xl mx-auto px-6">
          <div class="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
                For Employers
              </div>
              <h2 class="text-3xl lg:text-4xl font-bold text-white mb-6">
                Reward Doctors for<br/>
                <span class="text-emerald-400">Better Outcomes</span>
              </h2>
              <p class="text-slate-400 text-lg mb-8">
                Transform healthcare from a cost center to a competitive advantage.
                Partner with physicians who deliver measurable results.
              </p>
              <ul class="space-y-4 mb-8">
                <li class="flex items-center gap-3 text-slate-300">
                  <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Value-based compensation models
                </li>
                <li class="flex items-center gap-3 text-slate-300">
                  <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Real-time outcome dashboards
                </li>
                <li class="flex items-center gap-3 text-slate-300">
                  <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  23% average cost reduction
                </li>
              </ul>
              <a routerLink="/employers" class="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                Learn More
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>
            </div>

            <div class="relative">
              <div class="aspect-square rounded-3xl bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-500/20 p-8 flex items-center justify-center">
                <div class="text-center">
                  <div class="text-6xl mb-4">📊</div>
                  <div class="text-4xl font-bold text-white mb-2">$2.4M</div>
                  <div class="text-slate-400">Avg. Annual Savings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Deploy Better Care?
          </h2>
          <p class="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
            Join the providers and employers who are already seeing results.
            The future of healthcare is here.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/login" class="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all">
              Get Started Free
            </a>
            <a routerLink="/our-story" class="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all">
              Read Our Story
            </a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-16 bg-slate-950 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-6">
          <div class="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <a routerLink="/" class="flex items-center gap-2 mb-4">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
                <span class="font-semibold text-white">deploy<span class="text-indigo-400">.care</span></span>
              </a>
              <p class="text-sm text-slate-500">
                The backend of our wellness future.
              </p>
            </div>

            <div>
              <h4 class="font-semibold text-white mb-4">Platform</h4>
              <ul class="space-y-2">
                <li><a routerLink="/services" class="text-sm text-slate-400 hover:text-white transition-colors">Services</a></li>
                <li><a routerLink="/employers" class="text-sm text-slate-400 hover:text-white transition-colors">For Employers</a></li>
                <li><a routerLink="/clinical-trials" class="text-sm text-slate-400 hover:text-white transition-colors">Clinical Trials</a></li>
              </ul>
            </div>

            <div>
              <h4 class="font-semibold text-white mb-4">Company</h4>
              <ul class="space-y-2">
                <li><a routerLink="/our-story" class="text-sm text-slate-400 hover:text-white transition-colors">Our Story</a></li>
                <li><a href="#" class="text-sm text-slate-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" class="text-sm text-slate-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 class="font-semibold text-white mb-4">Legal</h4>
              <ul class="space-y-2">
                <li><a href="#" class="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" class="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" class="text-sm text-slate-400 hover:text-white transition-colors">HIPAA Compliance</a></li>
              </ul>
            </div>
          </div>

          <div class="pt-8 border-t border-slate-800 text-center">
            <p class="text-sm text-slate-500">
              © 2026 Deploy.Care. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class HomeComponent {
  stats = [
    { value: '50', label: 'States Active' },
    { value: '340+', label: 'Providers' },
    { value: '$47M', label: 'Claims Processed' },
    { value: '94%', label: 'Satisfaction' }
  ];

  services = [
    { abbrev: 'RPM', name: 'Remote Patient Monitoring', icon: '❤️', color: 'bg-red-500/20', description: 'Real-time vital signs and health data from connected devices.' },
    { abbrev: 'CCM', name: 'Chronic Care Management', icon: '📋', color: 'bg-indigo-500/20', description: 'Coordinated care for patients with multiple chronic conditions.' },
    { abbrev: 'PCM', name: 'Principal Care Management', icon: '🎯', color: 'bg-purple-500/20', description: 'Focused management for single high-risk conditions.' },
    { abbrev: 'TCM', name: 'Transitional Care', icon: '🔄', color: 'bg-cyan-500/20', description: '30-day intensive support after hospital discharge.' },
    { abbrev: 'CBT', name: 'Cognitive Behavioral Therapy', icon: '🧠', color: 'bg-emerald-500/20', description: 'Evidence-based behavioral health protocols.' },
    { abbrev: 'DTx', name: 'Digital Therapeutics', icon: '📱', color: 'bg-pink-500/20', description: 'Prescription-grade apps for targeted interventions.' }
  ];
}

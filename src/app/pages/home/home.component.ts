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
            <a routerLink="/" class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span class="text-xl font-semibold text-white">
                deploy<span class="text-purple-400">.care</span>
              </span>
            </a>

            <div class="hidden md:flex items-center gap-8">
              <a href="#macro" class="text-slate-300 hover:text-white transition-colors">Macro Wave</a>
              <a href="#specialties" class="text-slate-300 hover:text-white transition-colors">Specialties</a>
              <a href="#features" class="text-slate-300 hover:text-white transition-colors">Features</a>
              <a routerLink="/employers" class="text-slate-300 hover:text-white transition-colors">Employers</a>
              <a routerLink="/our-story" class="text-slate-300 hover:text-white transition-colors">Our Story</a>
            </div>

            <div class="flex items-center gap-4">
              <a routerLink="/login" class="text-slate-300 hover:text-white transition-colors">Sign In</a>
              <a routerLink="/login" class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-all">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="relative pt-32 pb-24 overflow-hidden">
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
              <a href="#macro" class="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                See the Macro Wave
              </a>
            </div>

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

      <!-- MACRO WAVE SECTION -->
      <section id="macro" class="py-24 bg-gradient-to-b from-slate-950 to-purple-950 relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-6 relative z-10">
          <div class="text-center mb-16">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full mb-6">
              <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span class="text-sm font-semibold text-green-300">The Macro Wave</span>
            </div>
            <h2 class="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ride the<br><span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Macro Wave</span>
            </h2>
            <p class="text-xl text-slate-300 max-w-3xl mx-auto">
              deploy.care rides the largest reimbursement shifts in healthcare history. Every model we support is backed by federal policy momentum.
            </p>
          </div>

          <!-- ACCESS Model Card -->
          <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 lg:p-12 border border-white/20 mb-8">
            <div class="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <div>
                    <h3 class="text-2xl font-bold text-white">CMS ACCESS Model</h3>
                    <p class="text-purple-300">Advancing Chronic Care with Effective, Scalable Solutions</p>
                  </div>
                </div>
                <p class="text-slate-300 mb-6">
                  The Innovation Center's 10-year national model launching <strong class="text-white">July 2026</strong>. Outcome-aligned payments that reward results — not activities. deploy.care is built for this.
                </p>
                <div class="grid grid-cols-2 gap-4 mb-6">
                  <div class="bg-white/5 rounded-xl p-4">
                    <p class="text-3xl font-black text-white">350+</p>
                    <p class="text-sm text-slate-400">Organizations applying</p>
                  </div>
                  <div class="bg-white/5 rounded-xl p-4">
                    <p class="text-3xl font-black text-white">10yr</p>
                    <p class="text-sm text-slate-400">Model duration</p>
                  </div>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span class="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">Hypertension</span>
                  <span class="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Diabetes</span>
                  <span class="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">Chronic Pain</span>
                  <span class="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm">Depression</span>
                </div>
              </div>
              <div class="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 class="text-lg font-bold text-white mb-4">Outcome-Aligned Payment</h4>
                <div class="space-y-4">
                  @for (outcome of outcomes; track outcome.metric) {
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <div>
                        <p class="text-white font-medium">{{ outcome.metric }}</p>
                        <p class="text-sm text-slate-400">Full payment earned</p>
                      </div>
                      <span class="ml-auto text-green-400 font-bold">{{ outcome.payment }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Reimbursement Reality Fields -->
          <div class="grid md:grid-cols-3 gap-6">
            @for (field of reimbursementFields; track field.title) {
              <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" [ngClass]="field.bgColor">
                  <svg class="w-6 h-6" [ngClass]="field.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="field.icon"/>
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-white mb-2">{{ field.title }}</h3>
                <p class="text-slate-400 text-sm mb-4">{{ field.description }}</p>
                <div class="flex items-center gap-2 text-sm text-green-400">
                  <span class="w-2 h-2 bg-green-400 rounded-full"></span>
                  Active field
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- SPECIALTIES SECTION -->
      <section id="specialties" class="py-24 bg-slate-900">
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-6">
              <span class="text-sm font-semibold text-purple-300">Care Models + Specialist Network</span>
            </div>
            <h2 class="text-4xl lg:text-5xl font-bold text-white mb-6">
              Deploy Care.<br><span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Connect Specialists.</span>
            </h2>
            <p class="text-xl text-slate-400 max-w-3xl mx-auto">
              Each care model explains when and why to use remote monitoring. Second opinions to specialists is the ultimate move — unite around your patient.
            </p>
          </div>

          <!-- mTBI Diagnostics -->
          <div class="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-3xl p-8 lg:p-12 border border-blue-500/20 mb-8">
            <div class="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div class="flex flex-wrap items-center gap-3 mb-4">
                  <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 rounded-full">
                    <span class="text-xs font-bold text-blue-300">mTBI DIAGNOSTICS</span>
                  </div>
                  <div class="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
                    <span class="text-xs font-bold text-cyan-300">Powered by Neuroglympse →</span>
                  </div>
                </div>
                <h3 class="text-3xl font-bold text-white mb-4">Objective Eye Movement Data</h3>
                <p class="text-lg text-slate-300 mb-6">
                  Quantify concussion severity with nystagmography and smooth pursuit tracking. Objective data that supports your clinical findings. <strong class="text-white">The PACS of Neurology</strong> — 30x growth last year, helping patients in 43 states find their cure.
                </p>
                <div class="space-y-4 mb-6">
                  @for (feature of mtbiFeatures; track feature.title) {
                    <div class="flex items-start gap-3">
                      <div class="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <div>
                        <p class="font-semibold text-white">{{ feature.title }}</p>
                        <p class="text-slate-400 text-sm">{{ feature.description }}</p>
                      </div>
                    </div>
                  }
                </div>
                <div class="flex flex-wrap gap-2">
                  <span class="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs font-mono">S06.0X0A</span>
                  <span class="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs font-mono">F07.81</span>
                  <span class="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs font-mono">H81.399</span>
                  <span class="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs font-mono">R42</span>
                </div>
              </div>
              <!-- Nystagmography Visualization -->
              <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div class="flex items-center justify-between mb-4">
                  <span class="font-bold text-white">Smooth Pursuit Analysis</span>
                  <span class="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">Irregular Pattern Detected</span>
                </div>
                <div class="bg-slate-900 rounded-xl p-4 mb-4">
                  <svg viewBox="0 0 400 150" class="w-full h-32">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" stroke-width="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="400" height="150" fill="url(#grid)"/>
                    <line x1="0" y1="75" x2="400" y2="75" stroke="#4B5563" stroke-width="1" stroke-dasharray="5,5"/>
                    <path d="M0,75 Q50,45 100,75 T200,75 T300,75 T400,75" fill="none" stroke="#22C55E" stroke-width="2" opacity="0.3"/>
                    <path d="M0,75 L20,70 L25,60 L30,68 Q50,40 70,50 L75,42 L80,55 Q100,80 120,70 L125,62 L130,73 Q150,45 170,55 L175,48 L180,58 Q200,85 220,75 L225,67 L230,78 Q250,40 270,55 L280,45 L290,58 Q320,88 340,75 L350,65 L360,77 Q380,50 400,60" fill="none" stroke="#06B6D4" stroke-width="2"/>
                    <circle cx="25" cy="60" r="3" fill="#EF4444"/>
                    <circle cx="75" cy="42" r="3" fill="#EF4444"/>
                    <circle cx="125" cy="62" r="3" fill="#EF4444"/>
                    <circle cx="175" cy="48" r="3" fill="#EF4444"/>
                    <circle cx="280" cy="45" r="3" fill="#EF4444"/>
                  </svg>
                </div>
                <div class="grid grid-cols-3 gap-4 text-center">
                  <div class="bg-slate-900 rounded-lg p-3">
                    <p class="text-2xl font-bold text-red-400">7</p>
                    <p class="text-xs text-slate-500">Saccadic Intrusions</p>
                  </div>
                  <div class="bg-slate-900 rounded-lg p-3">
                    <p class="text-2xl font-bold text-amber-400">68%</p>
                    <p class="text-xs text-slate-500">Pursuit Gain</p>
                  </div>
                  <div class="bg-slate-900 rounded-lg p-3">
                    <p class="text-2xl font-bold text-blue-400">142ms</p>
                    <p class="text-xs text-slate-500">Avg Latency</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Wound Care / PCR Section -->
          <div class="bg-gradient-to-br from-pink-900/30 to-orange-900/30 rounded-3xl p-8 lg:p-12 border border-pink-500/20 mb-8">
            <div class="grid lg:grid-cols-2 gap-12 items-center">
              <div class="order-2 lg:order-1">
                <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <div class="flex items-center justify-between mb-4">
                    <span class="font-bold text-white">PCR Pathogen Analysis</span>
                    <span class="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">Results Ready</span>
                  </div>
                  <div class="space-y-3 mb-4">
                    <div class="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                          <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        </div>
                        <div>
                          <p class="font-medium text-white">S. aureus (MRSA)</p>
                          <p class="text-xs text-slate-500">Methicillin-resistant</p>
                        </div>
                      </div>
                      <span class="text-red-400 font-bold text-sm">DETECTED</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <div>
                          <p class="font-medium text-white">P. aeruginosa</p>
                          <p class="text-xs text-slate-500">Gram-negative</p>
                        </div>
                      </div>
                      <span class="text-amber-400 font-bold text-sm">LOW</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                          <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <div>
                          <p class="font-medium text-white">E. coli</p>
                          <p class="text-xs text-slate-500">Common pathogen</p>
                        </div>
                      </div>
                      <span class="text-green-400 font-bold text-sm">NEGATIVE</span>
                    </div>
                  </div>
                  <div class="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <p class="text-sm text-blue-300"><strong>Treatment Recommendation:</strong> Vancomycin + wound debridement. Re-test in 7 days.</p>
                  </div>
                </div>
              </div>
              <div class="order-1 lg:order-2">
                <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-pink-500/20 rounded-full mb-4">
                  <span class="text-xs font-bold text-pink-300">WOUND CARE</span>
                </div>
                <h3 class="text-3xl font-bold text-white mb-4">PCR Testing & Pathogen Intelligence</h3>
                <p class="text-lg text-slate-300 mb-6">
                  Rapid molecular diagnostics for wound infections. Know exactly what you're treating in hours, not days.
                </p>
                <div class="space-y-4 mb-6">
                  @for (feature of woundCareFeatures; track feature.title) {
                    <div class="flex items-start gap-3">
                      <div class="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <div>
                        <p class="font-semibold text-white">{{ feature.title }}</p>
                        <p class="text-slate-400 text-sm">{{ feature.description }}</p>
                      </div>
                    </div>
                  }
                </div>
                <div class="flex flex-wrap gap-2">
                  <span class="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs font-mono">L89.xx</span>
                  <span class="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs font-mono">L97.xx</span>
                  <span class="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs font-mono">E11.621</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Connect with Specialist Banner -->
          <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">Connect With Specialists</h3>
                <p class="text-indigo-100">Second opinions. Consults. The ultimate move is uniting specialists around your patient.</p>
              </div>
            </div>
            <button class="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-slate-100 transition whitespace-nowrap">
              Explore Network
            </button>
          </div>

          <!-- Care Model Grid -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (model of careModels; track model.title) {
              <div class="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-indigo-500/50 transition group">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition" [ngClass]="model.bgColor">
                    <span class="text-2xl">{{ model.icon }}</span>
                  </div>
                  <div>
                    <h4 class="font-bold text-white">{{ model.title }}</h4>
                    <p class="text-xs text-slate-500">{{ model.subtitle }}</p>
                  </div>
                </div>
                <p class="text-sm text-slate-400 mb-4">{{ model.description }}</p>
                <div class="flex flex-wrap gap-1 mb-4">
                  @for (code of model.codes; track code) {
                    <span class="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs font-mono">{{ code }}</span>
                  }
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-500">{{ model.duration }}</span>
                  <span class="text-green-400 font-semibold">{{ model.price }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- FEATURES SECTION -->
      <section id="features" class="py-24 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-6 relative z-10">
          <div class="text-center mb-16">
            <h2 class="text-4xl font-bold text-white mb-4">Everything You Need to Deploy Care</h2>
            <p class="text-xl text-slate-400">Built for physicians, not billing departments</p>
          </div>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (feature of platformFeatures; track feature.title) {
              <div class="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-indigo-500/50 transition">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" [ngClass]="feature.bgColor">
                  <svg class="w-6 h-6" [ngClass]="feature.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="feature.icon"/>
                  </svg>
                </div>
                <h3 class="text-lg font-bold text-white mb-2">{{ feature.title }}</h3>
                <p class="text-slate-400 text-sm">{{ feature.description }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- For Employers -->
      <section class="py-24 bg-slate-950">
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
          <h2 class="text-3xl lg:text-5xl font-bold text-white mb-6">
            Ready to<br><span class="text-white/90">Exit Healthcare?</span>
          </h2>
          <p class="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
            Stop fighting systems that weren't built for you.<br>
            Build your own. Deploy your care. Exit on your terms.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a routerLink="/login" class="px-12 py-5 bg-white text-purple-600 font-bold rounded-xl hover:bg-slate-100 transition-all text-lg">
              Create Your Free Account
            </a>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-8 text-sm text-indigo-200">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              HIPAA Compliant
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              SOC 2 Certified
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              ACCESS Ready
            </div>
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <span class="font-semibold text-white">deploy<span class="text-purple-400">.care</span></span>
              </a>
              <p class="text-sm text-slate-500">
                The backend of our wellness future.
              </p>
            </div>

            <div>
              <h4 class="font-semibold text-white mb-4">Platform</h4>
              <ul class="space-y-2">
                <li><a href="#macro" class="text-sm text-slate-400 hover:text-white transition-colors">Macro Wave</a></li>
                <li><a href="#specialties" class="text-sm text-slate-400 hover:text-white transition-colors">Specialties</a></li>
                <li><a href="#features" class="text-sm text-slate-400 hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>

            <div>
              <h4 class="font-semibold text-white mb-4">Company</h4>
              <ul class="space-y-2">
                <li><a routerLink="/our-story" class="text-sm text-slate-400 hover:text-white transition-colors">Our Story</a></li>
                <li><a routerLink="/employers" class="text-sm text-slate-400 hover:text-white transition-colors">For Employers</a></li>
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

  outcomes = [
    { metric: 'BP < 140/90', payment: '$480/mo' },
    { metric: 'A1c < 8%', payment: '$520/mo' },
    { metric: 'Pain reduced 30%+', payment: '$440/mo' }
  ];

  reimbursementFields = [
    {
      title: 'RPM / RTM / CCM',
      description: 'Remote monitoring codes for scalable recurring revenue. $40-80/patient/month.',
      icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
      bgColor: 'bg-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      title: 'PI / LOP',
      description: 'Personal injury cases with law firm coordination and letter of protection workflows.',
      icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
      bgColor: 'bg-purple-500/20',
      iconColor: 'text-purple-400'
    },
    {
      title: 'Value-Based / ACO',
      description: 'Shared savings and at-risk models that reward outcomes over volume.',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      bgColor: 'bg-pink-500/20',
      iconColor: 'text-pink-400'
    }
  ];

  mtbiFeatures = [
    { title: 'Videonystagmography (VNG)', description: 'Track involuntary eye movements indicating vestibular dysfunction' },
    { title: 'Smooth Pursuit Analysis', description: 'Measure tracking irregularities and saccadic intrusions' },
    { title: 'Baseline Comparison', description: 'Track recovery progress with objective measurements over time' }
  ];

  woundCareFeatures = [
    { title: 'Multi-pathogen PCR Panel', description: 'Test for 20+ common wound pathogens simultaneously' },
    { title: 'Resistance Gene Detection', description: 'Identify MRSA, ESBL, VRE before culture results' },
    { title: 'Treatment Protocol Mapping', description: 'Auto-recommend evidence-based antimicrobial therapy' }
  ];

  careModels = [
    {
      title: 'CBT-I for Insomnia',
      subtitle: 'Cognitive Behavioral Therapy',
      icon: '🌙',
      bgColor: 'bg-indigo-500/20',
      description: 'Digital CBT-I delivered via RPM. Sleep diaries, stimulus control protocols, and sleep restriction therapy tracked remotely.',
      codes: ['G47.00', 'F51.01'],
      duration: '8-week protocol',
      price: '$2,400 RPM'
    },
    {
      title: 'CBT for Anxiety',
      subtitle: 'GAD & Panic Disorder',
      icon: '💡',
      bgColor: 'bg-amber-500/20',
      description: 'Structured anxiety management with GAD-7 tracking, exposure hierarchies, and breathing exercises monitored via RPM.',
      codes: ['F41.1', 'F41.0'],
      duration: '12-week protocol',
      price: '$3,600 RPM'
    },
    {
      title: 'Hypertension',
      subtitle: 'Blood Pressure Management',
      icon: '❤️',
      bgColor: 'bg-red-500/20',
      description: 'Daily BP monitoring with connected cuffs. Auto-alerts for readings >140/90. Medication titration tracking. ACCESS Model ready.',
      codes: ['I10', 'I11.9'],
      duration: 'Ongoing RPM',
      price: '$480/mo'
    },
    {
      title: 'Diabetes Management',
      subtitle: 'Type 2 Comprehensive',
      icon: '🩸',
      bgColor: 'bg-emerald-500/20',
      description: 'CGM integration, A1c tracking, medication adherence, and lifestyle coaching delivered through RPM protocols.',
      codes: ['E11.9', 'E11.65'],
      duration: 'Ongoing RPM',
      price: '$520/mo'
    },
    {
      title: 'Chronic Pain',
      subtitle: 'Multimodal Management',
      icon: '💊',
      bgColor: 'bg-purple-500/20',
      description: 'Pain scales, functional assessments, and opioid-sparing protocols with CBT integration for chronic pain patients.',
      codes: ['G89.29', 'M54.5'],
      duration: 'Ongoing RPM',
      price: '$440/mo'
    },
    {
      title: 'Depression',
      subtitle: 'PHQ-9 Monitored',
      icon: '🧠',
      bgColor: 'bg-cyan-500/20',
      description: 'Weekly PHQ-9 assessments, medication tracking, and behavioral activation protocols with escalation pathways.',
      codes: ['F32.1', 'F33.1'],
      duration: '16-week protocol',
      price: '$3,200 RPM'
    }
  ];

  platformFeatures = [
    {
      title: 'Care Model Studio',
      description: 'Build, version, and deploy clinical protocols as structured care models',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      bgColor: 'bg-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      title: 'Model Marketplace',
      description: 'License your models or expand capabilities from other specialists',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      bgColor: 'bg-purple-500/20',
      iconColor: 'text-purple-400'
    },
    {
      title: 'Coverage Eligibility',
      description: 'Auto-detect qualifying DX codes and request coverage from payers',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      bgColor: 'bg-green-500/20',
      iconColor: 'text-green-400'
    },
    {
      title: 'GatherMed RPM',
      description: 'Real-time physiologic data with auto-tracked TCM/CCM/RTM time',
      icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
      bgColor: 'bg-pink-500/20',
      iconColor: 'text-pink-400'
    },
    {
      title: 'VNG / Eye Tracking',
      description: 'Objective mTBI diagnostics with nystagmography integration',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      bgColor: 'bg-amber-500/20',
      iconColor: 'text-amber-400'
    },
    {
      title: 'Practice Analytics',
      description: 'Track valuation, ARR, and care model performance in real-time',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      bgColor: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400'
    }
  ];
}

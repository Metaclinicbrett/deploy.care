import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950">
      <!-- Hero -->
      <section class="relative overflow-hidden">
        <!-- Cinematic Background -->
        <div class="absolute inset-0">
          <div class="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-slate-950 to-slate-950"></div>
          <div class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
          <div class="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]"></div>
          <div class="absolute bottom-0 left-1/2 w-[800px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px]"></div>
        </div>

        <!-- Grid Pattern -->
        <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

        <div class="relative max-w-4xl mx-auto px-6 py-32 lg:py-48 text-center">
          <div class="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-slate-300 text-sm mb-10">
            <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            January 2026 • Out of Stealth
          </div>

          <h1 class="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
            We've Been Building<br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              The Future of Wellness
            </span>
          </h1>

          <p class="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            After years in stealth mode, deploy.care is ready to show the world
            what's possible when technology truly serves human health.
          </p>
        </div>
      </section>

      <!-- The Story -->
      <section class="py-24">
        <article class="max-w-3xl mx-auto px-6">
          <!-- Opening -->
          <div class="prose prose-invert prose-lg mx-auto mb-20">
            <p class="text-2xl text-slate-300 leading-relaxed font-light">
              In 2021, while the world was reeling from a pandemic, a small team of healthcare
              veterans and technologists gathered with a singular question:
              <em class="text-white">"What would healthcare look like if we designed it from scratch?"</em>
            </p>
          </div>

          <!-- Timeline -->
          <div class="relative">
            <!-- Vertical Line -->
            <div class="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500"></div>

            @for (item of timeline; track item.year) {
              <div class="relative pl-24 pb-20 last:pb-0">
                <!-- Year Badge -->
                <div class="absolute left-0 w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center"
                     [ngClass]="item.gradient">
                  <span class="text-white font-bold text-sm">{{ item.year }}</span>
                </div>

                <!-- Content -->
                <div class="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-8">
                  <h3 class="text-2xl font-bold text-white mb-4">{{ item.title }}</h3>
                  <p class="text-slate-400 leading-relaxed mb-6">{{ item.content }}</p>

                  @if (item.highlight) {
                    <div class="bg-slate-800/50 rounded-xl p-6 border-l-4"
                         [ngClass]="item.borderColor">
                      <p class="text-slate-300 italic">"{{ item.highlight }}"</p>
                    </div>
                  }

                  @if (item.metrics) {
                    <div class="grid grid-cols-3 gap-4 mt-6">
                      @for (metric of item.metrics; track metric.label) {
                        <div class="text-center">
                          <div class="text-2xl font-bold text-white">{{ metric.value }}</div>
                          <div class="text-xs text-slate-500">{{ metric.label }}</div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </article>
      </section>

      <!-- Operating Companies -->
      <section class="py-24 bg-slate-900/50">
        <div class="max-w-6xl mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="text-3xl lg:text-4xl font-bold text-white mb-4">The OpCo Ecosystem</h2>
            <p class="text-slate-400 max-w-2xl mx-auto">
              While building deploy.care, we operated through specialized companies—each
              solving a piece of the wellness puzzle, all feeding into a unified platform.
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (opco of opcos; track opco.name) {
              <div class="group relative">
                <div class="absolute inset-0 bg-gradient-to-br rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                     [ngClass]="opco.gradient"></div>
                <div class="relative bg-slate-900 rounded-2xl border border-slate-800 p-8 h-full group-hover:border-transparent transition-all">
                  <div class="w-14 h-14 rounded-xl mb-6 flex items-center justify-center"
                       [ngClass]="opco.iconBg">
                    <span class="text-2xl">{{ opco.icon }}</span>
                  </div>
                  <h3 class="text-xl font-semibold text-white mb-2">{{ opco.name }}</h3>
                  <p class="text-slate-400 text-sm leading-relaxed mb-4">{{ opco.description }}</p>
                  <div class="flex items-center gap-2 text-xs">
                    <span class="px-2 py-1 bg-slate-800 text-slate-400 rounded">{{ opco.tag }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- The Vision -->
      <section class="py-24 relative overflow-hidden">
        <div class="absolute inset-0">
          <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-t from-indigo-600/20 to-transparent rounded-full blur-[100px]"></div>
        </div>

        <div class="relative max-w-4xl mx-auto px-6">
          <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-slate-700 p-12 lg:p-16">
            <div class="max-w-2xl mx-auto text-center">
              <div class="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>

              <blockquote class="text-2xl lg:text-3xl text-white font-light leading-relaxed mb-8">
                "We didn't just build a platform. We built the backend of our wellness future—
                an infrastructure where care coordination, monitoring, and outcomes align perfectly."
              </blockquote>

              <div class="flex items-center justify-center gap-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold">
                  B
                </div>
                <div class="text-left">
                  <div class="font-semibold text-white">Brett</div>
                  <div class="text-sm text-slate-400">Founder, Deploy.Care</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- What's Next -->
      <section class="py-24">
        <div class="max-w-6xl mx-auto px-6">
          <div class="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 class="text-3xl lg:text-4xl font-bold text-white mb-6">
                The Future is<br/>
                <span class="text-indigo-400">Already Here</span>
              </h2>
              <p class="text-slate-400 text-lg leading-relaxed mb-8">
                What we've built isn't vaporware or a five-year roadmap. It's real,
                it's working, and it's transforming outcomes for patients and providers
                across the country right now.
              </p>
              <p class="text-slate-400 leading-relaxed mb-8">
                Deploy.care represents the convergence of everything we've learned—
                every algorithm refined, every workflow optimized, every integration
                battle-tested. The stealth phase is over. The deployment phase begins.
              </p>

              <a routerLink="/platform" class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all">
                Explore the Platform
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>
            </div>

            <!-- Art/Graphic Element -->
            <div class="relative">
              <div class="aspect-square rounded-3xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 p-8 lg:p-12">
                <!-- Animated Orbs -->
                <div class="absolute top-1/4 left-1/4 w-4 h-4 bg-indigo-400 rounded-full animate-ping"></div>
                <div class="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-ping" style="animation-delay: 0.5s"></div>
                <div class="absolute bottom-1/4 left-1/3 w-5 h-5 bg-cyan-400 rounded-full animate-ping" style="animation-delay: 1s"></div>

                <!-- Central Icon -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                    <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                </div>

                <!-- Orbital Rings -->
                <div class="absolute inset-8 border border-indigo-500/20 rounded-full"></div>
                <div class="absolute inset-16 border border-purple-500/20 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div class="max-w-4xl mx-auto px-6 text-center">
          <h2 class="text-3xl lg:text-4xl font-bold text-white mb-6">
            Join Us in Deploying Better Care
          </h2>
          <p class="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
            Whether you're an employer, provider, or patient—there's a place
            for you in this new era of healthcare.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/contact" class="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all">
              Get in Touch
            </a>
            <a routerLink="/services" class="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all">
              Explore Services
            </a>
          </div>
        </div>
      </section>
    </div>
  `
})
export class StoryComponent {
  timeline = [
    {
      year: '2021',
      title: 'The Quiet Beginning',
      content: 'Founded in the shadow of COVID-19, we saw healthcare\'s cracks more clearly than ever. Remote monitoring wasn\'t optional anymore—it was essential. We started building.',
      highlight: 'What if every patient could have continuous, connected care?',
      gradient: 'from-indigo-600 to-indigo-700',
      borderColor: 'border-indigo-500'
    },
    {
      year: '2022',
      title: 'Operating in the Shadows',
      content: 'We launched multiple operating companies, each addressing a specific need: chronic care management, remote patient monitoring, behavioral health integration. Each success fed back into the core platform.',
      metrics: [
        { value: '3', label: 'OpCos Launched' },
        { value: '12K', label: 'Patients Served' },
        { value: '89%', label: 'Retention Rate' }
      ],
      gradient: 'from-purple-600 to-purple-700',
      borderColor: 'border-purple-500'
    },
    {
      year: '2023',
      title: 'The Infrastructure Phase',
      content: 'FHIR integration, clinical trial matching, settlement workflows, assessment engines—we were building the rails that modern healthcare would run on. Investors took notice.',
      highlight: 'Series A funding secured. The vision was validated.',
      gradient: 'from-pink-600 to-pink-700',
      borderColor: 'border-pink-500'
    },
    {
      year: '2024',
      title: 'Scaling Quietly',
      content: 'Expanded to 50 states. Partnered with major employers. Onboarded hundreds of physicians. The platform was battle-tested and ready. We just needed the right moment.',
      metrics: [
        { value: '50', label: 'States Active' },
        { value: '340+', label: 'Providers' },
        { value: '$47M', label: 'Claims Processed' }
      ],
      gradient: 'from-cyan-600 to-cyan-700',
      borderColor: 'border-cyan-500'
    },
    {
      year: '2026',
      title: 'Out of Stealth',
      content: 'Today, we\'re ready. Deploy.care isn\'t a promise—it\'s a proven platform. The backend of wellness is built. Now we\'re opening the doors.',
      highlight: 'The future of healthcare isn\'t coming. It\'s deployed.',
      gradient: 'from-emerald-600 to-emerald-700',
      borderColor: 'border-emerald-500'
    }
  ];

  opcos = [
    {
      name: 'NeuroCare Connect',
      icon: '🧠',
      iconBg: 'bg-indigo-500/20',
      gradient: 'from-indigo-600/20 to-transparent',
      description: 'Specialized neurology care coordination for TBI, concussion, and chronic neurological conditions.',
      tag: 'Neurology'
    },
    {
      name: 'VitalWatch RPM',
      icon: '❤️',
      iconBg: 'bg-red-500/20',
      gradient: 'from-red-600/20 to-transparent',
      description: 'Remote patient monitoring infrastructure with 50+ device integrations and real-time alerting.',
      tag: 'RPM'
    },
    {
      name: 'MindBridge Behavioral',
      icon: '🌱',
      iconBg: 'bg-emerald-500/20',
      gradient: 'from-emerald-600/20 to-transparent',
      description: 'Integrated behavioral health with CBT protocols, PHQ-9/GAD-7 automation, and therapy matching.',
      tag: 'Behavioral'
    },
    {
      name: 'ChronicCare Plus',
      icon: '📊',
      iconBg: 'bg-purple-500/20',
      gradient: 'from-purple-600/20 to-transparent',
      description: 'CCM and PCM programs for diabetes, hypertension, and other chronic conditions at scale.',
      tag: 'CCM/PCM'
    },
    {
      name: 'TransitionRx',
      icon: '🔄',
      iconBg: 'bg-cyan-500/20',
      gradient: 'from-cyan-600/20 to-transparent',
      description: 'Transitional care management reducing readmissions through 30-day intensive follow-up.',
      tag: 'TCM'
    },
    {
      name: 'TrialMatch AI',
      icon: '🔬',
      iconBg: 'bg-pink-500/20',
      gradient: 'from-pink-600/20 to-transparent',
      description: 'AI-powered clinical trial matching connecting patients with breakthrough treatments.',
      tag: 'Trials'
    }
  ];
}

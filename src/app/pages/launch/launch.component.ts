import { Component, signal, computed, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ScrollSection {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  visual: 'transcript' | 'diagnosis' | 'care-models' | 'interact' | 'studio';
  direction: 'left' | 'right' | 'up';
}

@Component({
  selector: 'app-launch',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="launch-container" #container>
      <!-- Fixed Header -->
      <header
        class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        [class]="scrollProgress() > 0.05 ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'"
      >
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a routerLink="/" class="text-2xl font-bold">
            <span [class]="scrollProgress() > 0.05 ? 'text-gray-900' : 'text-white'">deploy</span>
            <span class="text-blue-500">.care</span>
          </a>
          <a
            routerLink="/login"
            class="px-5 py-2 rounded-full text-sm font-medium transition-all"
            [class]="scrollProgress() > 0.05
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'"
          >
            Get Started
          </a>
        </div>
      </header>

      <!-- Hero Section -->
      <section
        class="min-h-screen flex items-center justify-center relative overflow-hidden"
        [style.opacity]="1 - (scrollProgress() * 2)"
        [style.transform]="'translateY(' + (scrollProgress() * -100) + 'px)'"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900"></div>
        <div class="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10"></div>

        <div class="relative z-10 text-center px-6 max-w-4xl">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm mb-8">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            The future of care delivery
          </div>

          <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Exit Healthcare.<br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Enter Care.
            </span>
          </h1>

          <p class="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            Optimize your business position by creating licensable delivery of care.
            Opt in or sub out the ongoing work under your medical scope.
            Dial in the exact details that make your care model unique.
          </p>

          <div class="flex items-center justify-center gap-4">
            <a routerLink="/login" class="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-105">
              Build Your Care Model
            </a>
            <button
              (click)="scrollToContent()"
              class="px-8 py-4 border border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-all"
            >
              See How It Works
            </button>
          </div>

          <div class="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
            <svg class="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </div>
        </div>
      </section>

      <!-- Scroll-Driven Story Sections -->
      <div class="relative bg-gray-50" #storyContainer>

        <!-- Section 1: The Problem -->
        <section
          class="min-h-screen flex items-center py-24 px-6"
          [class.section-visible]="visibleSections().has('problem')"
          id="problem"
        >
          <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div
              class="transform transition-all duration-1000"
              [class]="visibleSections().has('problem') ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'"
            >
              <span class="text-blue-600 font-semibold text-sm tracking-wide uppercase">Step 1</span>
              <h2 class="text-4xl font-bold text-gray-900 mt-2 mb-6">You have a patient that needs care</h2>
              <p class="text-lg text-gray-600 leading-relaxed">
                A patient walks in with complex symptoms. They need specialized care,
                but coordinating across providers, managing documentation, and ensuring
                proper reimbursement is a nightmare.
              </p>
              <p class="text-lg text-gray-600 leading-relaxed mt-4">
                What if you could focus on the care while the business runs itself?
              </p>
            </div>

            <div
              class="transform transition-all duration-1000 delay-300"
              [class]="visibleSections().has('problem') ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'"
            >
              <!-- Animated Patient Card -->
              <div class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    JD
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">John Doe</h3>
                    <p class="text-gray-500 text-sm">New Patient • Referred by PCP</p>
                  </div>
                </div>
                <div class="space-y-3">
                  <div class="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                    <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <span class="text-amber-800 text-sm">Complex case requiring multi-specialty coordination</span>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <span class="text-gray-600 text-sm">Prior records, imaging, lab results pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 2: Send Transcript -->
        <section
          class="min-h-screen flex items-center py-24 px-6 bg-white"
          [class.section-visible]="visibleSections().has('transcript')"
          id="transcript"
        >
          <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div
              class="order-2 md:order-1 transform transition-all duration-1000"
              [class]="visibleSections().has('transcript') ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'"
            >
              <!-- Transcript Animation -->
              <div class="bg-gray-900 rounded-2xl p-6 font-mono text-sm">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-3 h-3 rounded-full bg-red-500"></div>
                  <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                  <span class="text-gray-500 text-xs ml-2">transcript.txt</span>
                </div>
                <div class="space-y-2 text-gray-300">
                  <p><span class="text-blue-400">Provider:</span> "Patient presents with persistent headaches post-MVA..."</p>
                  <p><span class="text-green-400">Patient:</span> "The headaches started about 3 weeks ago..."</p>
                  <p><span class="text-blue-400">Provider:</span> "Any vision changes or cognitive difficulties?"</p>
                  <p><span class="text-green-400">Patient:</span> "Yes, I've been having trouble concentrating..."</p>
                  <p class="text-purple-400 animate-pulse">▌</p>
                </div>
              </div>
            </div>

            <div
              class="order-1 md:order-2 transform transition-all duration-1000 delay-300"
              [class]="visibleSections().has('transcript') ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'"
            >
              <span class="text-blue-600 font-semibold text-sm tracking-wide uppercase">Step 2</span>
              <h2 class="text-4xl font-bold text-gray-900 mt-2 mb-6">Send your transcript to Deploy Care</h2>
              <p class="text-lg text-gray-600 leading-relaxed">
                Upload your encounter notes, voice recordings, or transcripts.
                Our AI understands clinical context and extracts the information
                that matters for care coordination.
              </p>
              <div class="mt-8 flex items-center gap-4">
                <div class="flex items-center gap-2 text-green-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span class="text-sm">HIPAA Compliant</span>
                </div>
                <div class="flex items-center gap-2 text-green-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span class="text-sm">End-to-end encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 3: Diagnosis Extracted -->
        <section
          class="min-h-screen flex items-center py-24 px-6"
          [class.section-visible]="visibleSections().has('diagnosis')"
          id="diagnosis"
        >
          <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div
              class="transform transition-all duration-1000"
              [class]="visibleSections().has('diagnosis') ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'"
            >
              <span class="text-blue-600 font-semibold text-sm tracking-wide uppercase">Step 3</span>
              <h2 class="text-4xl font-bold text-gray-900 mt-2 mb-6">Diagnosis pulled out with matching care models</h2>
              <p class="text-lg text-gray-600 leading-relaxed">
                ICD-10 codes are automatically extracted and matched to your
                available care models. See exactly which treatment pathways
                apply and what reimbursement looks like.
              </p>
            </div>

            <div
              class="transform transition-all duration-1000 delay-300"
              [class]="visibleSections().has('diagnosis') ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'"
            >
              <!-- Diagnosis Cards -->
              <div class="space-y-4">
                <div class="bg-white rounded-xl shadow-lg p-5 border-l-4 border-blue-500 transform hover:scale-102 transition-transform">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-blue-600 font-semibold">S06.0X0A</span>
                    <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">3 Care Models</span>
                  </div>
                  <p class="text-gray-900 font-medium">Concussion without loss of consciousness, initial encounter</p>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-5 border-l-4 border-purple-500 transform hover:scale-102 transition-transform">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-purple-600 font-semibold">F07.81</span>
                    <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">2 Care Models</span>
                  </div>
                  <p class="text-gray-900 font-medium">Postconcussional syndrome</p>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-5 border-l-4 border-amber-500 transform hover:scale-102 transition-transform">
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-amber-600 font-semibold">R51.9</span>
                    <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">5 Care Models</span>
                  </div>
                  <p class="text-gray-900 font-medium">Headache, unspecified</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Section 4: Care Models Pop Up -->
        <section
          class="min-h-screen flex items-center py-24 px-6 bg-white"
          [class.section-visible]="visibleSections().has('models')"
          id="models"
        >
          <div class="max-w-7xl mx-auto">
            <div
              class="text-center mb-16 transform transition-all duration-1000"
              [class]="visibleSections().has('models') ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'"
            >
              <span class="text-blue-600 font-semibold text-sm tracking-wide uppercase">Step 4</span>
              <h2 class="text-4xl font-bold text-gray-900 mt-2 mb-6">Care models pop up — select your approach</h2>
              <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                Each care model is a complete package: diagnosis pathways, treatment protocols,
                CPT codes, pricing, and reimbursement all pre-configured.
              </p>
            </div>

            <div class="grid md:grid-cols-3 gap-6">
              @for (model of careModels; track model.name; let i = $index) {
                <div
                  class="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 transform transition-all duration-700"
                  [class]="visibleSections().has('models') ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'"
                  [style.transition-delay]="(i * 150) + 'ms'"
                >
                  <div
                    class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold mb-4"
                    [class]="model.color"
                  >
                    {{ model.name.charAt(0) }}
                  </div>
                  <h3 class="text-xl font-bold text-gray-900 mb-2">{{ model.name }}</h3>
                  <p class="text-gray-600 text-sm mb-4">{{ model.description }}</p>
                  <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span class="text-2xl font-bold text-gray-900">{{ model.price }}</span>
                    <span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">{{ model.type }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- Section 5: Interact / Care Studio -->
        <section
          class="min-h-screen flex items-center py-24 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900"
          [class.section-visible]="visibleSections().has('studio')"
          id="studio"
        >
          <div class="max-w-7xl mx-auto">
            <div
              class="text-center mb-16 transform transition-all duration-1000"
              [class]="visibleSections().has('studio') ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'"
            >
              <span class="text-blue-400 font-semibold text-sm tracking-wide uppercase">Step 5</span>
              <h2 class="text-4xl font-bold text-white mt-2 mb-6">Interact with your Care Studio</h2>
              <p class="text-lg text-white/70 max-w-2xl mx-auto">
                Your care model comes to life. Track patients, manage encounters,
                coordinate with partners, and optimize reimbursement — all in one place.
              </p>
            </div>

            <!-- Mock Care Studio UI -->
            <div
              class="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-1000 delay-300"
              [class]="visibleSections().has('studio') ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'"
            >
              <!-- Mock Header -->
              <div class="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <span class="font-bold text-gray-900">Care Studio</span>
                  <span class="text-gray-400">|</span>
                  <span class="text-gray-600">RPM - mTBI Protocol</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">12 Active Cases</span>
                </div>
              </div>

              <!-- Mock Content -->
              <div class="grid md:grid-cols-4 divide-x divide-gray-100">
                <!-- Sidebar -->
                <div class="p-4 bg-gray-50">
                  <div class="space-y-2">
                    <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">JD</div>
                        <div>
                          <p class="text-sm font-medium text-gray-900">John Doe</p>
                          <p class="text-xs text-gray-500">Active • Day 5</p>
                        </div>
                      </div>
                    </div>
                    <div class="p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-bold">SM</div>
                        <div>
                          <p class="text-sm font-medium text-gray-900">Sarah Miller</p>
                          <p class="text-xs text-gray-500">Active • Day 12</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Main Content -->
                <div class="col-span-3 p-6">
                  <div class="grid grid-cols-3 gap-4 mb-6">
                    <div class="p-4 bg-blue-50 rounded-xl">
                      <p class="text-sm text-blue-600 mb-1">Encounters</p>
                      <p class="text-2xl font-bold text-blue-900">3/6</p>
                    </div>
                    <div class="p-4 bg-green-50 rounded-xl">
                      <p class="text-sm text-green-600 mb-1">Billed</p>
                      <p class="text-2xl font-bold text-green-900">$1,240</p>
                    </div>
                    <div class="p-4 bg-purple-50 rounded-xl">
                      <p class="text-sm text-purple-600 mb-1">Collected</p>
                      <p class="text-2xl font-bold text-purple-900">$890</p>
                    </div>
                  </div>

                  <div class="border border-gray-200 rounded-xl p-4">
                    <h4 class="font-semibold text-gray-900 mb-3">Care Timeline</h4>
                    <div class="space-y-3">
                      <div class="flex items-center gap-4">
                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                        <span class="text-sm text-gray-600">Initial TeleNeurology Consult</span>
                        <span class="text-xs text-gray-400 ml-auto">Jan 24</span>
                      </div>
                      <div class="flex items-center gap-4">
                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                        <span class="text-sm text-gray-600">Assessment: PHQ-9 Completed</span>
                        <span class="text-xs text-gray-400 ml-auto">Jan 26</span>
                      </div>
                      <div class="flex items-center gap-4">
                        <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span class="text-sm text-gray-900 font-medium">RPM Check-in #1</span>
                        <span class="text-xs text-blue-600 ml-auto">Today</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="py-24 px-6 bg-white">
          <div class="max-w-4xl mx-auto text-center">
            <h2 class="text-4xl font-bold text-gray-900 mb-6">
              Ready to build your care model?
            </h2>
            <p class="text-lg text-gray-600 mb-12">
              Join healthcare providers who are transforming how they deliver and monetize care.
            </p>
            <div class="flex items-center justify-center gap-4">
              <a routerLink="/login" class="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all hover:scale-105">
                Start Building
              </a>
              <a href="mailto:hello@deploy.care" class="px-8 py-4 border border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all">
                Talk to Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .launch-container {
      overflow-x: hidden;
    }

    .section-visible {
      /* Marker class for visible sections */
    }

    :host {
      display: block;
    }
  `]
})
export class LaunchComponent implements AfterViewInit {
  @ViewChild('container') container!: ElementRef;
  @ViewChild('storyContainer') storyContainer!: ElementRef;

  scrollY = signal(0);
  windowHeight = signal(typeof window !== 'undefined' ? window.innerHeight : 800);

  scrollProgress = computed(() => {
    const progress = this.scrollY() / this.windowHeight();
    return Math.min(Math.max(progress, 0), 1);
  });

  visibleSections = signal<Set<string>>(new Set());

  careModels = [
    {
      name: 'TeleNeurology',
      description: 'Remote neurological assessment and ongoing monitoring for mTBI patients.',
      price: '$495',
      type: 'DX/TX',
      color: 'bg-gradient-to-br from-blue-500 to-purple-600'
    },
    {
      name: 'RPM - mTBI',
      description: 'Continuous remote patient monitoring with weekly check-ins and symptom tracking.',
      price: '$89/mo',
      type: 'TX',
      color: 'bg-gradient-to-br from-teal-500 to-cyan-600'
    },
    {
      name: 'VNS Therapy',
      description: 'Vagus nerve stimulation program for treatment-resistant cases.',
      price: '$299/mo',
      type: 'TX',
      color: 'bg-gradient-to-br from-pink-500 to-rose-600'
    }
  ];

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.scrollY.set(window.scrollY);
    this.checkVisibleSections();
  }

  @HostListener('window:resize')
  onResize() {
    this.windowHeight.set(window.innerHeight);
  }

  ngAfterViewInit() {
    // Initial check
    setTimeout(() => {
      this.checkVisibleSections();
    }, 100);
  }

  checkVisibleSections() {
    const sections = ['problem', 'transcript', 'diagnosis', 'models', 'studio'];
    const visible = new Set<string>();

    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Section is visible if it's within the viewport
        if (rect.top < windowHeight * 0.75 && rect.bottom > 0) {
          visible.add(id);
        }
      }
    });

    this.visibleSections.set(visible);
  }

  scrollToContent() {
    const problemSection = document.getElementById('problem');
    if (problemSection) {
      problemSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

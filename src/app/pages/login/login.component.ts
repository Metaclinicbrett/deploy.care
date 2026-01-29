import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <!-- Background Effects -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[80px]"></div>
      </div>

      <div class="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl w-full max-w-md p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <a routerLink="/" class="inline-flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <span class="text-2xl font-bold text-white">deploy<span class="text-indigo-400">.care</span></span>
          </a>
          <p class="text-slate-400 mt-2">
            {{ isSignUp() ? 'Create your account' : 'Sign in to your account' }}
          </p>
        </div>

        <!-- Error Message -->
        @if (error()) {
          <div class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {{ error() }}
          </div>
        }

        <!-- Success Message -->
        @if (success()) {
          <div class="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm">
            {{ success() }}
          </div>
        }

        <!-- Auth Form -->
        @if (!showMagicLink()) {
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            @if (isSignUp()) {
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-1">First Name</label>
                  <input
                    type="text"
                    [(ngModel)]="firstName"
                    name="firstName"
                    class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    [(ngModel)]="lastName"
                    name="lastName"
                    class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>
            }

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                [minlength]="isSignUp() ? 8 : 0"
                class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
              @if (isSignUp()) {
                <p class="mt-1 text-xs text-slate-500">Minimum 8 characters</p>
              }
            </div>

            <button
              type="submit"
              [disabled]="isLoading()"
              class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
            >
              @if (isLoading()) {
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  {{ isSignUp() ? 'Creating account...' : 'Signing in...' }}
                </span>
              } @else {
                {{ isSignUp() ? 'Create Account' : 'Sign In' }}
              }
            </button>
          </form>

          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-slate-700"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-slate-900 text-slate-500">Or continue with</span>
              </div>
            </div>

            <button
              (click)="showMagicLink.set(true)"
              class="mt-4 w-full py-3 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 transition"
            >
              Magic Link (Passwordless)
            </button>
          </div>
        } @else {
          <!-- Magic Link Form -->
          <form (ngSubmit)="onMagicLink()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              [disabled]="isLoading()"
              class="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50"
            >
              @if (isLoading()) {
                Sending...
              } @else {
                Send Magic Link
              }
            </button>

            <button
              type="button"
              (click)="showMagicLink.set(false)"
              class="w-full py-3 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-800 transition"
            >
              Back to Password Login
            </button>
          </form>
        }

        <p class="mt-8 text-center text-sm text-slate-400">
          @if (isSignUp()) {
            Already have an account?
            <button (click)="isSignUp.set(false)" class="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign In
            </button>
          } @else {
            Don't have an account?
            <button (click)="isSignUp.set(true)" class="text-indigo-400 hover:text-indigo-300 font-medium">
              Create Account
            </button>
          }
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  firstName = '';
  lastName = '';
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  showMagicLink = signal(false);
  isSignUp = signal(false);

  async onSubmit() {
    if (!this.email || !this.password) {
      this.error.set('Please enter email and password');
      return;
    }

    if (this.isSignUp() && this.password.length < 8) {
      this.error.set('Password must be at least 8 characters');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      if (this.isSignUp()) {
        await this.authService.signUp(this.email, this.password, this.firstName, this.lastName);
        this.success.set('Account created! Check your email to verify your account, then sign in.');
        this.isSignUp.set(false);
        this.password = '';
      } else {
        await this.authService.signIn(this.email, this.password);
        // Check if user is pending approval
        if (this.authService.isPendingApproval()) {
          this.router.navigate(['/pending-approval']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      }
    } catch (err: any) {
      this.error.set(err.message || (this.isSignUp() ? 'Failed to create account' : 'Invalid email or password'));
    } finally {
      this.isLoading.set(false);
    }
  }

  async onMagicLink() {
    if (!this.email) {
      this.error.set('Please enter your email');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.authService.signInWithMagicLink(this.email);
      this.success.set('Check your email for the magic link!');
    } catch (err: any) {
      this.error.set(err.message || 'Failed to send magic link');
    } finally {
      this.isLoading.set(false);
    }
  }
}

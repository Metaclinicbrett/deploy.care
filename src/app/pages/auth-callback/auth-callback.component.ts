import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-950 flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center animate-pulse">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-white mb-2">Authenticating...</h2>
        <p class="text-slate-400">{{ message }}</p>
        @if (error) {
          <div class="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 max-w-md mx-auto">
            {{ error }}
            <button (click)="goToLogin()" class="block mt-3 mx-auto text-indigo-400 hover:text-indigo-300">
              Return to Login
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  message = 'Please wait while we verify your session...';
  error: string | null = null;

  async ngOnInit() {
    try {
      // Give Supabase time to process the URL hash
      await this.waitForAuth();
    } catch (err: any) {
      this.error = err.message || 'Authentication failed';
    }
  }

  private async waitForAuth(): Promise<void> {
    // Wait for the auth service to finish loading
    const maxWait = 10000; // 10 seconds
    const checkInterval = 100;
    let waited = 0;

    while (this.authService.loading() && waited < maxWait) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }

    // Check authentication state
    if (this.authService.loading()) {
      throw new Error('Authentication timed out. Please try again.');
    }

    // Navigate based on auth state
    if (this.authService.isPendingApproval()) {
      this.message = 'Account pending approval...';
      this.router.navigate(['/pending-approval']);
    } else if (this.authService.isAuthenticated()) {
      this.message = 'Success! Redirecting...';
      if (this.authService.isLawFirm()) {
        this.router.navigate(['/law-firm/dashboard']);
      } else {
        this.router.navigate(['/dashboard']);
      }
    } else {
      // No session found - might be an expired link
      throw new Error('Invalid or expired authentication link. Please request a new one.');
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

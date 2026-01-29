import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pending-approval',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <!-- Icon -->
        <div class="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-2">Account Pending Approval</h1>
        <p class="text-gray-600 mb-6">
          Your account has been created but is waiting for admin approval.
          You'll receive an email once your account is activated.
        </p>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-500">Signed in as</p>
          <p class="font-medium text-gray-900">{{ authService.user()?.email }}</p>
        </div>

        <button
          (click)="signOut()"
          class="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  `
})
export class PendingApprovalComponent {
  authService = inject(AuthService);

  async signOut() {
    await this.authService.signOut();
  }
}

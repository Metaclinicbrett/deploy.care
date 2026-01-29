import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export type UserRole = 'super_admin' | 'org_admin' | 'provider' | 'staff' | 'user' | 'law_firm';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  organization_id: string | null;
  organization_name?: string | null;
  is_approved: boolean;
  avatar_url: string | null;
}

export interface ImpersonationState {
  isImpersonating: boolean;
  originalUserId: string | null;
  impersonatingOrgId: string | null;
  impersonatingOrgName: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  // Auth state
  private _user = signal<User | null>(null);
  private _session = signal<Session | null>(null);
  private _profile = signal<UserProfile | null>(null);
  private _loading = signal<boolean>(true);
  private _impersonation = signal<ImpersonationState>({
    isImpersonating: false,
    originalUserId: null,
    impersonatingOrgId: null,
    impersonatingOrgName: null
  });

  // Public computed signals
  readonly user = computed(() => this._user());
  readonly session = computed(() => this._session());
  readonly profile = computed(() => this._profile());
  readonly loading = computed(() => this._loading());
  readonly impersonation = computed(() => this._impersonation());

  readonly isAuthenticated = computed(() => !!this._user() && !!this._profile()?.is_approved);
  readonly isAdmin = computed(() => this._profile()?.role === 'super_admin');
  readonly isOrgAdmin = computed(() => ['super_admin', 'org_admin'].includes(this._profile()?.role || ''));
  readonly isPendingApproval = computed(() => !!this._user() && !this._profile()?.is_approved);
  readonly isLawFirm = computed(() => this._profile()?.role === 'law_firm');
  readonly isProvider = computed(() => ['provider', 'staff'].includes(this._profile()?.role || ''));
  readonly canManageSettlements = computed(() =>
    ['super_admin', 'org_admin', 'provider', 'law_firm'].includes(this._profile()?.role || '')
  );

  // Current organization context (real or impersonated)
  readonly currentOrgId = computed(() =>
    this._impersonation().impersonatingOrgId || this._profile()?.organization_id
  );

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );

    if (isPlatformBrowser(this.platformId)) {
      this.initializeAuth();
    }
  }

  private async initializeAuth() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();

      if (session?.user) {
        this._user.set(session.user);
        this._session.set(session);
        await this.loadProfile(session.user.id);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      this._loading.set(false);
    }

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      this._user.set(session?.user ?? null);
      this._session.set(session);

      if (session?.user) {
        await this.loadProfile(session.user.id);
      } else {
        this._profile.set(null);
        this.clearImpersonation();
      }

      if (event === 'SIGNED_OUT') {
        this.router.navigate(['/login']);
      }
    });
  }

  private async loadProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select(`
          *,
          organization:organizations(name)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      this._profile.set({
        id: data.id,
        email: this._user()?.email || '',
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        organization_id: data.organization_id,
        organization_name: data.organization?.name,
        is_approved: data.is_approved,
        avatar_url: data.avatar_url
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      // Profile doesn't exist yet - user needs setup
      this._profile.set(null);
    }
  }

  // Auth methods
  async signUp(email: string, password: string, firstName?: string, lastName?: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }

  async signInWithMagicLink(email: string) {
    const { data, error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    this.clearImpersonation();
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email: string) {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    if (error) throw error;
    return data;
  }

  // Admin impersonation
  async stepIntoOrg(orgId: string, orgName: string) {
    if (!this.isAdmin()) {
      throw new Error('Only super admins can impersonate organizations');
    }

    this._impersonation.set({
      isImpersonating: true,
      originalUserId: this._user()?.id || null,
      impersonatingOrgId: orgId,
      impersonatingOrgName: orgName
    });

    // Store in localStorage for persistence
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('impersonation', JSON.stringify(this._impersonation()));
    }
  }

  stepOut() {
    this.clearImpersonation();
  }

  private clearImpersonation() {
    this._impersonation.set({
      isImpersonating: false,
      originalUserId: null,
      impersonatingOrgId: null,
      impersonatingOrgName: null
    });

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('impersonation');
    }
  }

  // Restore impersonation from localStorage
  restoreImpersonation() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('impersonation');
      if (stored && this.isAdmin()) {
        this._impersonation.set(JSON.parse(stored));
      }
    }
  }

  // Get Supabase client for direct queries
  get client() {
    return this.supabase;
  }
}

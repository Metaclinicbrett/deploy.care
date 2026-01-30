import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// Database input types for type-safe mutations
export interface CaseInput {
  patient_id: string;
  care_plan_id: string | number;
  status?: 'active' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
  organization_id?: string;
  assigned_to?: string;
  created_at?: string;
}

export interface PatientInput {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  insurance_provider?: string;
  insurance_id?: string;
}

export interface EncounterDbInput {
  case_id: string;
  encounter_date: string;
  encounter_type?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  provider_id?: string;
  notes?: string;
  cpt_codes?: string[];
  icd_codes?: string[];
  billed_amount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private platformId = inject(PLATFORM_ID);

  // Auth state signals
  readonly authState = signal<AuthState>({
    user: null,
    session: null,
    loading: true
  });

  readonly user = computed(() => this.authState().user);
  readonly session = computed(() => this.authState().session);
  readonly isAuthenticated = computed(() => !!this.authState().user);
  readonly isLoading = computed(() => this.authState().loading);

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
    // Get initial session
    const { data: { session } } = await this.supabase.auth.getSession();
    this.authState.set({
      user: session?.user ?? null,
      session: session,
      loading: false
    });

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.authState.set({
        user: session?.user ?? null,
        session: session,
        loading: false
      });
    });
  }

  // Auth methods
  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
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
    const redirectUrl = isPlatformBrowser(this.platformId)
      ? `${window.location.origin}/auth/callback`
      : environment.appUrl ? `${environment.appUrl}/auth/callback` : undefined;

    const { data, error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email: string) {
    const redirectUrl = isPlatformBrowser(this.platformId)
      ? `${window.location.origin}/auth/reset-password`
      : environment.appUrl ? `${environment.appUrl}/auth/reset-password` : undefined;

    const { data, error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    if (error) throw error;
    return data;
  }

  // Database methods
  get client() {
    return this.supabase;
  }

  // Care Plans
  async getCarePlans() {
    const { data, error } = await this.supabase
      .from('care_plans')
      .select(`
        *,
        diagnosis_codes (code, description),
        cpt_codes (code)
      `)
      .order('name');
    if (error) throw error;
    return data;
  }

  async getCarePlan(id: string) {
    const { data, error } = await this.supabase
      .from('care_plans')
      .select(`
        *,
        diagnosis_codes (code, description),
        cpt_codes (code)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  // Cases
  async getCases() {
    const { data, error } = await this.supabase
      .from('cases')
      .select(`
        *,
        patient:patients (*),
        care_plan:care_plans (*),
        encounters (*)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getCase(id: string) {
    const { data, error } = await this.supabase
      .from('cases')
      .select(`
        *,
        patient:patients (*),
        care_plan:care_plans (*),
        encounters (*),
        documents (*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async createCase(caseData: CaseInput) {
    const { data, error } = await this.supabase
      .from('cases')
      .insert(caseData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Patients
  async getPatients() {
    const { data, error } = await this.supabase
      .from('patients')
      .select('*')
      .order('last_name');
    if (error) throw error;
    return data;
  }

  async createPatient(patientData: PatientInput) {
    const { data, error } = await this.supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Encounters
  async createEncounter(encounterData: EncounterDbInput) {
    const { data, error } = await this.supabase
      .from('encounters')
      .insert(encounterData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateEncounter(id: string, updates: Partial<EncounterDbInput>) {
    const { data, error } = await this.supabase
      .from('encounters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Real-time subscriptions
  subscribeToCase(caseId: string, callback: (payload: { new: Record<string, unknown>; old: Record<string, unknown>; eventType: string }) => void) {
    return this.supabase
      .channel(`case:${caseId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'cases', filter: `id=eq.${caseId}` },
        callback
      )
      .subscribe();
  }

  // File storage
  async uploadDocument(bucket: string, path: string, file: File) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file);
    if (error) throw error;
    return data;
  }

  getPublicUrl(bucket: string, path: string) {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }
}

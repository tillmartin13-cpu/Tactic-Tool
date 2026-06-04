import { usesTeamleaderApp, type UserRole } from '@sg/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isSupabaseConfigured, supabase } from './supabase';

export interface Profile {
  id: string;
  name: string;
  kuerzel: string | null;
  role: UserRole;
}

interface AuthContextValue {
  loading: boolean;
  session: boolean;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  bypassAuth: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const bypassAuth = !isSupabaseConfigured();
  const [loading, setLoading] = useState(!bypassAuth);
  const [session, setSession] = useState(bypassAuth);
  const [profile, setProfile] = useState<Profile | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!supabase) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, kuerzel, role')
      .eq('id', u.user.id)
      .maybeSingle();
    if (error) throw error;
    if (data) setProfile(data as Profile);
  }, []);

  useEffect(() => {
    if (bypassAuth) {
      setLoading(false);
      return;
    }
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_ev, s) => {
      setSession(!!s);
      if (s) void refreshProfile();
      else setProfile(null);
    });

    return () => sub.subscription.unsubscribe();
  }, [bypassAuth, refreshProfile]);

  useEffect(() => {
    if (session && !bypassAuth) void refreshProfile();
  }, [session, bypassAuth, refreshProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      session,
      profile,
      signIn,
      resetPassword,
      signOut,
      refreshProfile,
      bypassAuth,
    }),
    [loading, session, profile, signIn, resetPassword, signOut, refreshProfile, bypassAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}

export function canAccessTeamleaderApp(profile: Profile | null, bypass: boolean): boolean {
  if (bypass) return true;
  if (!profile) return false;
  return usesTeamleaderApp(profile.role);
}

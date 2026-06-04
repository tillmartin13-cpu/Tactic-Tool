import {
  canAccessPhotographerApp,
  canAccessTeamleaderApp,
  type UserEventMembership,
  type UserRole,
} from '@sg/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loadUserEventMembership } from './membership';
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
  membership: UserEventMembership;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    name: string;
    kuerzel?: string;
  }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  bypassAuth: boolean;
  canUseTeamleaderApp: boolean;
  canUsePhotographerApp: boolean;
}

const emptyMembership: UserEventMembership = {
  teamleaderEventIds: [],
  officeEventIds: [],
  photographerEventIds: [],
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const bypassAuth = !isSupabaseConfigured();
  const [loading, setLoading] = useState(!bypassAuth);
  const [session, setSession] = useState(bypassAuth);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [membership, setMembership] = useState<UserEventMembership>(emptyMembership);

  const refreshProfile = useCallback(async () => {
    if (!supabase) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setProfile(null);
      setMembership(emptyMembership);
      return;
    }
    const [{ data, error }, mem] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, name, kuerzel, role')
        .eq('id', u.user.id)
        .maybeSingle(),
      loadUserEventMembership(u.user.id),
    ]);
    if (error) throw error;
    if (data) setProfile(data as Profile);
    setMembership(mem);
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
      else {
        setProfile(null);
        setMembership(emptyMembership);
      }
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

  const signUp = useCallback(
    async (input: { email: string; password: string; name: string; kuerzel?: string }) => {
      if (!supabase) throw new Error('Supabase not configured');
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          data: {
            name: input.name.trim(),
            kuerzel: input.kuerzel?.trim().toUpperCase() || null,
          },
        },
      });
      if (error) throw error;
      if (data.user && !data.session) {
        throw new Error(
          'Registrierung angelegt — bitte E-Mail bestätigen, dann anmelden (oder in Supabase „Auto Confirm“ aktivieren).',
        );
      }
    },
    [],
  );

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
    setMembership(emptyMembership);
  }, []);

  const canUseTeamleaderApp =
    bypassAuth || canAccessTeamleaderApp(profile?.role, membership);
  const canUsePhotographerApp =
    bypassAuth || canAccessPhotographerApp(profile?.role, membership);

  const value = useMemo(
    () => ({
      loading,
      session,
      profile,
      membership,
      signIn,
      signUp,
      resetPassword,
      signOut,
      refreshProfile,
      bypassAuth,
      canUseTeamleaderApp,
      canUsePhotographerApp,
    }),
    [
      loading,
      session,
      profile,
      membership,
      signIn,
      signUp,
      resetPassword,
      signOut,
      refreshProfile,
      bypassAuth,
      canUseTeamleaderApp,
      canUsePhotographerApp,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}

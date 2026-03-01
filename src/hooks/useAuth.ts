import React from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

type AppRole = 'teacher' | 'staff' | 'superuser' | null;

export function useAuth() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [role, setRole] = React.useState<AppRole>(null);
  const [loading, setLoading] = React.useState(true);
  const [authError, setAuthError] = React.useState<string | null>(null);

  const normalizeRole = React.useCallback((value: unknown): AppRole => {
    if (value === 'staff' || value === 'superuser' || value === 'teacher') return value;
    return null;
  }, []);

  const refreshRole = React.useCallback(async (userId?: string | null): Promise<AppRole> => {
    if (!userId) {
      setRole(null);
      return null;
    }

    // Fuente principal en frontend: profiles del usuario autenticado.
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    const fromProfile = normalizeRole(data?.role);
    if (!error && fromProfile) {
      setRole(fromProfile);
      return fromProfile;
    }

    if (error) {
      console.error('useAuth.refreshRole profiles error', error);
    }

    // Fallback: RPC current_role si profiles no devolvio rol.
    const { data: rpcRole, error: rpcErr } = await supabase.rpc('current_role');
    const fromRpc = normalizeRole(rpcRole);
    if (!rpcErr && fromRpc) {
      setRole(fromRpc);
      return fromRpc;
    }

    const resolved = 'teacher';
    setRole(resolved);
    return resolved;
  }, [normalizeRole]);

  React.useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      await refreshRole(data.session?.user?.id ?? null);
      if (mounted) setLoading(false);
    };

    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      try {
        await refreshRole(nextSession?.user?.id ?? null);
      } catch (e) {
        console.error('useAuth.onAuthStateChange refreshRole error', e);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [refreshRole]);

  const signIn = React.useCallback(async (email: string, password: string): Promise<AppRole> => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    const userId = data.user?.id ?? data.session?.user?.id ?? null;
    const resolvedRole = await refreshRole(userId);
    setSession(data.session ?? null);
    return resolvedRole;
  }, [refreshRole]);

  const signOut = React.useCallback(async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    setRole(null);
    setSession(null);
  }, []);

  const isAuthenticated = Boolean(session?.user);
  const isStaff = role === 'staff' || role === 'superuser';
  const isSuperuser = role === 'superuser';

  return {
    session,
    role,
    loading,
    authError,
    setAuthError,
    isAuthenticated,
    isStaff,
    isSuperuser,
    signIn,
    signOut,
    refreshRole
  };
}

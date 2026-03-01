import React from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { isUsingPlaceholder } from '../lib/supabaseClient';

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

    if (error || rpcErr) {
      const message = rpcErr?.message || error?.message || 'No se pudo resolver el rol del usuario.';
      throw new Error(message);
    }

    const resolved = 'teacher';
    setRole(resolved);
    return resolved;
  }, [normalizeRole]);

  React.useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      setLoading(true);
      const timeoutId = setTimeout(() => {
        if (mounted) {
          console.warn('useAuth.bootstrap timeout after 5s');
          setLoading(false);
          setAuthError('Tiempo de espera agotado al verificar sesión.');
        }
      }, 5000);

      try {
        if (isUsingPlaceholder) {
          console.warn('useAuth.bootstrap: skipping Supabase calls due to placeholder configuration');
          setSession(null);
          setRole(null);
          return;
        }
        console.log('useAuth.bootstrap: calling supabase.auth.getSession');
        const { data, error } = await supabase.auth.getSession();
        console.log('useAuth.bootstrap: getSession returned', { data, error });
        clearTimeout(timeoutId);
        if (error) throw error;
        if (!mounted) return;
        setSession(data.session);
        await refreshRole(data.session?.user?.id ?? null);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('useAuth.bootstrap error', error);
        if (mounted) {
          setSession(null);
          setRole(null);
          setAuthError(error instanceof Error ? error.message : 'No se pudo verificar la sesión.');
        }
      } finally {
        clearTimeout(timeoutId);
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (isUsingPlaceholder) return;
      setSession(nextSession);
      setAuthError(null);
      try {
        await refreshRole(nextSession?.user?.id ?? null);
      } catch (e) {
        console.error('useAuth.onAuthStateChange refreshRole error', e);
        setRole(null);
        setAuthError(e instanceof Error ? e.message : 'No se pudo resolver el rol del usuario.');
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
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
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      // If there is no active auth session in Supabase, still clear local UI state.
      const isMissingSession = /session|Auth session missing/i.test(error.message ?? '');
      if (!isMissingSession) {
        setAuthError(error.message);
        throw error;
      }
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

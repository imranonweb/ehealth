import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Fetch profile from profiles table ──────────────── */
  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        // Join doctor_profiles so Doctor pages can read specialization/license/bio
        // without a second query. PostgREST returns doctor_profiles as an array;
        // we normalise it to the singular `doctor_profile` key below so all
        // existing consumers continue to work without modification.
        .select('*, doctor_profiles(*)')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }

      // Normalise: flatten the one-to-one doctor_profiles array → singular object
      const doctor_profile = data.doctor_profiles?.[0] ?? null;
      return { ...data, doctor_profile };
    } catch (err) {
      console.error('Profile fetch failed:', err);
      return null;
    }
  }, []);

  /* ── Initialize auth state ─────────────────────────── */
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id);
          if (mounted && p) {
            setProfile(p);
            setRole(p.role);
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    /* Listen for auth changes (login, logout, token refresh) */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setProfile(null);
          setRole(null);
          setLoading(false);
          return;
        }

        setUser(session.user);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const p = await fetchProfile(session.user.id);
          if (mounted && p) {
            setProfile(p);
            setRole(p.role);
          }
        }

        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /* ── Sign In ───────────────────────────────────────── */
  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Eagerly fetch the app profile so Login.jsx can navigate to the correct
    // role portal immediately, without waiting for the async onAuthStateChange
    // listener. This prevents the redirect flash where non-patient users
    // briefly land on /patient before being bounced to their real portal.
    const p = await fetchProfile(data.user.id);
    if (p) {
      setProfile(p);
      setRole(p.role);
    }

    // Return role alongside the Supabase session so Login.jsx has it synchronously
    return { ...data, role: p?.role };
  }, [fetchProfile]);

  /* ── Sign Up ───────────────────────────────────────── */
  const signUp = useCallback(async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;

    /* Create profile row after successful signup */
    if (data.user) {
      const profileData = {
        auth_user_id: data.user.id,
        role: metadata.role || 'patient',
        full_name: metadata.full_name || '',
        email,
        phone: metadata.phone || null,
        date_of_birth: metadata.date_of_birth || null,
        gender: metadata.gender || null,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      /* Create role-specific profile */
      const prof = await fetchProfile(data.user.id);
      if (prof) {
        await createRoleProfile(prof, metadata);
        setProfile(prof);
        setRole(prof.role);
      }
    }

    return data;
  }, [fetchProfile]);

  /* ── Create role-specific profile rows ─────────────── */
  async function createRoleProfile(profile, metadata) {
    const r = profile.role;

    if (r === 'doctor') {
      await supabase.from('doctor_profiles').insert([{
        profile_id: profile.id,
        specialization: metadata.specialization || null,
        license_number: metadata.license_number || null,
        qualification: metadata.qualification || null,
      }]);
    } else if (r === 'patient') {
      await supabase.from('patient_profiles').insert([{
        profile_id: profile.id,
      }]);
    } else if (r === 'diagnostics' || r === 'hospital') {
      await supabase.from('organizations').insert([{
        name: metadata.org_name || metadata.full_name || '',
        type: r,
        address: metadata.address || null,
        phone: metadata.phone || null,
        email: profile.email,
        license_number: metadata.license_number || null,
      }]);
    }
  }

  /* ── Sign Out ──────────────────────────────────────── */
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  /* ── Reset Password ────────────────────────────────── */
  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }, []);

  /* ── Update Password ───────────────────────────────── */
  const updatePassword = useCallback(async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }, []);

  const value = {
    user,
    profile,
    role,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile: async () => {
      if (user) {
        const p = await fetchProfile(user.id);
        if (p) { setProfile(p); setRole(p.role); }
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

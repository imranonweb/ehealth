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
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }

      let doctor_profile = null;
      let patient_profile = null;

      if (profileData.role === 'doctor') {
        const { data: docData } = await supabase
          .from('doctor_profiles')
          .select('*')
          .eq('profile_id', profileData.id)
          .single();
        doctor_profile = docData || null;
      } else if (profileData.role === 'patient') {
        const { data: patData } = await supabase
          .from('patient_profiles')
          .select('*')
          .eq('profile_id', profileData.id)
          .single();
        patient_profile = patData || null;
      }

      return { ...profileData, doctor_profile, patient_profile };
    } catch (err) {
      console.error('Profile fetch failed:', err);
      return null;
    }
  }, []);

  /* ── Initialize auth state ─────────────────────────── */
  useEffect(() => {
    let mounted = true;
    let initialResolved = false;

    async function handleSession(session) {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id);
        if (mounted) {
          if (p) {
            setProfile(p);
            setRole(p.role);
          } else {
            setProfile(null);
            setRole(null);
          }
          setLoading(false);
        }
      } else {
        if (mounted) {
          setUser(null);
          setProfile(null);
          setRole(null);
          setLoading(false);
        }
      }
    }

    // 1. Initial explicit session get
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!initialResolved && mounted) {
        initialResolved = true;
        handleSession(session);
      }
    }).catch((err) => {
      console.error('Auth getSession error:', err);
      if (mounted) setLoading(false);
    });

    // 2. Listen for subsequent auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setRole(null);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
          initialResolved = true;
          await handleSession(session);
        }
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
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;

    // Profile creation is handled entirely by the database trigger
    // handle_new_auth_user() which runs AFTER INSERT ON auth.users.
    // This works for all roles and for email-confirmation flows too.
    //
    // If a session was returned immediately (no email confirmation required),
    // eagerly fetch the profile so the UI can navigate to the correct portal.
    if (data.session && data.user) {
      const p = await fetchProfile(data.user.id);
      if (p) {
        setProfile(p);
        setRole(p.role);
      }
    }

    return data;
  }, [fetchProfile]);

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

  /* ── Resend Confirmation Email ─────────────────────── */
  const resendConfirmation = useCallback(async (email) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
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
    resendConfirmation,
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

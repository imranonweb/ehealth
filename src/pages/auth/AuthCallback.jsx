import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Activity, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  // Guard against React StrictMode double-invocation
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    async function handleCallback() {
      const code = searchParams.get('code');

      if (!code) {
        setError('No verification code found in the link. Please request a new confirmation email.');
        return;
      }

      try {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          setError(exchangeError.message || 'Email verification failed. The link may have expired.');
          return;
        }

        // Sign out immediately — we only verified the email.
        // The user will sign in deliberately on /login.
        await supabase.auth.signOut();

        navigate('/login', {
          replace: true,
          state: { verified: true },
        });
      } catch (err) {
        setError(err?.message || 'An unexpected error occurred during verification.');
      }
    }

    handleCallback();
  }, [navigate, searchParams]);

  /* -- Error state */
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        padding: '24px',
      }}>
        <div className="card" style={{
          width: '100%',
          maxWidth: 440,
          padding: '40px 36px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-default)',
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <AlertCircle size={28} />
          </div>
          <h1 className="h2" style={{ fontSize: '1.25rem', marginBottom: 10 }}>
            Verification Failed
          </h1>
          <p className="body-md text-muted" style={{ lineHeight: 1.6, marginBottom: 28 }}>
            {error}
          </p>
          <Link to="/login" className="btn btn-primary btn-lg w-full">
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  /* -- Loading state */
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: '24px',
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: 440,
        padding: '40px 36px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border-default)',
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          backgroundColor: 'var(--color-teal-bg)', color: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Activity size={28} />
        </div>
        <h1 className="h2" style={{ fontSize: '1.25rem', marginBottom: 10 }}>
          Verifying Your Email
        </h1>
        <p className="body-md text-muted" style={{ lineHeight: 1.6, marginBottom: 24 }}>
          Please wait while we confirm your email address...
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Loader2 size={28} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(6, 15, 20, 0.7)',
  border: '1px solid rgba(46, 168, 223, 0.15)',
  borderRadius: '8px',
  color: 'var(--color-fg)',
  fontSize: 'var(--text-base)',
  lineHeight: 'var(--leading-normal)',
  outline: 'none',
  transition: 'border-color 0.18s ease',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [initError, setInitError] = useState('');
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Also catch PASSWORD_RECOVERY for implicit/hash-based flow
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    async function init() {
      // PKCE flow: Supabase sends ?code=... in the URL
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setInitError('הקישור לא תקין או שפג תוקפו — בקש קישור חדש');
        } else {
          setReady(true);
        }
        return;
      }

      // Implicit/hash flow fallback: check existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setReady(true);
      }
    }

    init();
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (password !== confirm) {
      setFormError('הסיסמאות אינן תואמות');
      return;
    }
    if (password.length < 6) {
      setFormError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      setFormError('שגיאה בעדכון הסיסמה — נסה שוב');
    } else {
      await supabase.auth.signOut();
      setDone(true);
      setTimeout(() => router.push('/'), 3000);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-fg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: 'rgba(10,22,30,0.75)',
        border: '1px solid rgba(46,168,223,0.12)',
        borderRadius: '16px',
        padding: '36px 32px',
        backdropFilter: 'blur(16px)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{
            fontSize: '1.0625rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            T<span style={{ color: 'var(--color-accent)' }}>·</span>ESTATE
          </span>
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 8 }}>הסיסמה עודכנה!</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-secondary)' }}>
              מעביר אותך לדף הכניסה…
            </div>
          </div>
        ) : initError ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠</div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 8, color: 'var(--color-danger)' }}>
              קישור לא תקין
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-secondary)', marginBottom: 20 }}>
              {initError}
            </div>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              חזור לדף הכניסה
            </button>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '3px solid rgba(46,168,223,0.2)',
              borderTopColor: 'var(--color-accent)',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }} />
            <div style={{ fontSize: 'var(--text-base)', color: 'var(--color-secondary)' }}>
              מאמת קישור…
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 6 }}>
              איפוס סיסמה
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-secondary)', marginBottom: 24, fontWeight: 300 }}>
              הכנס סיסמה חדשה לחשבונך
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-secondary)', marginBottom: 6 }}>
                  סיסמה חדשה
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="לפחות 6 תווים"
                  dir="ltr"
                  autoComplete="new-password"
                  minLength={6}
                  style={inputBase}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(46,168,223,0.45)'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(46,168,223,0.15)'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-secondary)', marginBottom: 6 }}>
                  אמת סיסמה
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="חזור על הסיסמה"
                  dir="ltr"
                  autoComplete="new-password"
                  style={inputBase}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(46,168,223,0.45)'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(46,168,223,0.15)'}
                />
              </div>

              {formError && (
                <div style={{
                  padding: '10px 14px',
                  background: 'var(--color-danger-bg)',
                  border: '1px solid rgba(240,104,120,0.2)',
                  borderRadius: '8px',
                  color: 'var(--color-danger)',
                  fontSize: 'var(--text-sm)',
                }}>
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ width: '100%', marginTop: 4 }}
              >
                {submitting ? 'שומר…' : 'עדכן סיסמה'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [orgName, setOrgName] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function validateToken() {
      const res = await fetch(`/api/invites/accept?token=${encodeURIComponent(token)}`);
      const json = await res.json();
      if (json.valid) {
        setOrgName(json.org_name);
        setTokenValid(true);
      } else {
        setTokenError(json.error || 'קישור לא תקין');
        setTokenValid(false);
      }
    }
    validateToken();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/invites/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email, password, full_name: fullName }),
    });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error || 'שגיאה ביצירת החשבון');
      setLoading(false);
      return;
    }

    setDone(true);
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-white text-xl font-bold mb-2">קישור לא תקין</h1>
          <p className="text-gray-500 text-sm">{tokenError}</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-white text-xl font-bold mb-2">החשבון נוצר בהצלחה!</h1>
          <p className="text-gray-400 text-sm mb-6">תוכל כעת להתחבר למערכת עם המייל והסיסמה שבחרת.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            עבור לכניסה
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold">הצטרף ל-Re-Estate</h1>
          <p className="text-gray-400 text-sm mt-1">
            הוזמנת להצטרף למשרד <span className="text-white font-medium">{orgName}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">שם מלא</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="ישראל ישראלי"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">אימייל</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="agent@example.com"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="לפחות 6 תווים"
              required
              minLength={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !fullName || !email || !password}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? '...' : 'צור חשבון והצטרף'}
          </button>
        </form>
      </div>
    </div>
  );
}

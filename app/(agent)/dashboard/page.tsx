'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Stats {
  activeProperties: number;
  unreadMessages: number;
  activeLinks: number;
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

export default function DashboardPage() {
  const { agent, organization } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(json => { if (!json.error) setStats(json); });
  }, []);

  const statItems = [
    { label: 'נכסים פעילים',    value: stats?.activeProperties ?? '—' },
    { label: 'הודעות שלא נקראו', value: stats?.unreadMessages   ?? '—' },
    { label: 'קישורים פעילים',   value: stats?.activeLinks      ?? '—' },
  ];

  const firstName = agent?.full_name?.split(' ')[0] || 'סוכן';

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 32px' }}>

      {/* Greeting */}
      <div style={{ marginBottom: 48 }}>
        <p style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-muted)',
          fontWeight: 500,
          marginBottom: 8,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          ברוך הבא
        </p>
        <h1 style={{
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
          fontWeight: 700,
          color: 'var(--color-fg)',
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
        }}>
          שלום, <span style={{ color: 'var(--color-accent)' }}>{firstName}</span>
        </h1>
        {organization && (
          <p style={{ marginTop: 8, fontSize: 'var(--text-sm)', color: 'var(--color-secondary)', fontWeight: 300 }}>
            {organization.name}
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
        background: 'var(--color-border)',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 40,
        border: '1px solid var(--color-border)',
      }}>
        {statItems.map((s, i) => (
          <div key={i} style={{ background: 'var(--color-surface)', padding: '28px 28px 24px', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, left: 0, height: 2,
              background: i === 0 ? 'var(--color-accent)' : 'var(--color-border)',
              opacity: i === 0 ? 0.7 : 0.5,
            }}/>
            <div style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
              fontWeight: 700,
              color: 'var(--color-accent)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              marginBottom: 10,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-secondary)', fontWeight: 500, letterSpacing: '0.03em' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

        {/* Quick Actions */}
        <div className="card-surface" style={{ padding: '28px 24px' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-fg)', marginBottom: 20 }}>
            פעולות מהירות
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link
              href="/properties/new"
              className="btn-primary"
              style={{ textDecoration: 'none', justifyContent: 'space-between', padding: '12px 16px', fontSize: 'var(--text-sm)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconPlus />הוסף נכס חדש
              </span>
              <IconArrow />
            </Link>
            {[
              { href: '/properties', label: 'כל הנכסים' },
              { href: '/messages',   label: 'הודעות לקוחות' },
            ].map(a => (
              <Link
                key={a.href}
                href={a.href}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: 'var(--color-secondary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 400,
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(46,168,223,0.25)';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-fg)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-secondary)';
                }}
              >
                {a.label}<IconArrow />
              </Link>
            ))}
          </div>
        </div>

        {/* Office Info */}
        <div className="card-surface" style={{ padding: '28px 24px' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-fg)', marginBottom: 20 }}>
            פרטי המשרד
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { label: 'שם המשרד', value: organization?.name || '—' },
              { label: 'תפקיד',    value: agent?.role === 'admin' ? 'מנהל' : 'סוכן' },
              { label: 'אימייל',   value: agent?.email || '—' },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--color-border-soft)' : 'none',
                }}
              >
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', fontWeight: 400 }}>{row.label}</span>
                <span style={{
                  fontSize: 'var(--text-sm)',
                  color: row.label === 'תפקיד' && agent?.role === 'admin' ? 'var(--color-accent)' : 'var(--color-fg)',
                  fontWeight: 500,
                  direction: row.label === 'אימייל' ? 'ltr' : 'rtl',
                }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

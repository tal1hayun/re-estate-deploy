'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const NAV_ITEMS = [
  { href: '/home',         label: 'בית'    },
  { href: '/properties',   label: 'נכסים'  },
  { href: '/organization', label: 'סוכנים' },
];

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const { user, agent, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) router.push('/');
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <div className="spinner" />
      </div>
    );
  }

  const agentInitial =
    agent?.full_name?.[0]?.toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    '?';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>

      {/* ── Premium nav bar ── */}
      <header
        dir="ltr"
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          height: 52,
          padding: '0 48px',
          background: 'rgba(6, 15, 20, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(46, 168, 223, 0.06)',
        }}
      >
        {/* Logo → links to /home */}
        <Link href="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', userSelect: 'none' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 200, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'rgba(240, 244, 246, 0.55)' }}>
              re
            </span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 200, color: 'var(--color-accent)', opacity: 0.5, margin: '0 1px', letterSpacing: 0 }}>
              ·
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'rgba(240, 244, 246, 0.92)' }}>
              estate
            </span>
          </div>
          <span
            className="dot-live"
            style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0 }}
          />
        </Link>

        {/* Logo → nav separator */}
        <div style={{ marginLeft: 20, width: 1, height: 16, background: 'rgba(46, 168, 223, 0.08)', flexShrink: 0 }} />

        {/* Nav items — centered */}
        <nav style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40 }}>
          {NAV_ITEMS.map(item => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/home' && pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-link${isActive ? ' nav-link-active' : ''}`}
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 500 : 300,
                  textDecoration: 'none',
                  letterSpacing: '0.005em',
                  padding: '4px 0',
                  userSelect: 'none',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Nav → user area separator */}
        <div style={{ marginRight: 14, width: 1, height: 16, background: 'rgba(46, 168, 223, 0.08)', flexShrink: 0 }} />

        {/* User area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button
            onClick={signOut}
            style={{
              padding: '5px 14px',
              background: 'transparent',
              border: '1px solid rgba(46, 168, 223, 0.1)',
              borderRadius: 5,
              color: 'rgba(122, 154, 170, 0.45)',
              fontSize: '0.75rem', fontWeight: 400,
              cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '0.05em',
              transition: 'border-color 0.18s, color 0.18s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(240, 104, 120, 0.25)';
              e.currentTarget.style.color = 'rgba(240, 104, 120, 0.65)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(46, 168, 223, 0.1)';
              e.currentTarget.style.color = 'rgba(122, 154, 170, 0.45)';
            }}
          >
            יציאה
          </button>

          {/* Agent avatar */}
          <div style={{
            width: 26, height: 26,
            borderRadius: '50%',
            background: 'rgba(46, 168, 223, 0.08)',
            border: '1px solid rgba(46, 168, 223, 0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 500, color: 'rgba(46, 168, 223, 0.75)', lineHeight: 1 }}>
              {agentInitial}
            </span>
          </div>
        </div>
      </header>

      {/* Page content — below fixed nav */}
      <main style={{ paddingTop: 52 }}>
        {children}
      </main>
    </div>
  );
}

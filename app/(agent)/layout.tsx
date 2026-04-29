'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';

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
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', transition: 'background 0.3s' }}>

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
          background: 'var(--color-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--color-border)',
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        {/* Logo → links to /home */}
        <Link href="/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', userSelect: 'none' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 200, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--color-secondary)' }}>
              re
            </span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 200, color: 'var(--color-accent)', opacity: 0.6, margin: '0 1px', letterSpacing: 0 }}>
              ·
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.11em', textTransform: 'uppercase', color: 'var(--color-fg)' }}>
              estate
            </span>
          </div>
          <span
            className="dot-live"
            style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: 'var(--color-success)', flexShrink: 0 }}
          />
        </Link>

        {/* Logo → nav separator */}
        <div style={{ marginLeft: 20, width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0 }} />

        {/* Nav items — centered */}
        <nav style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
          {NAV_ITEMS.map(item => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/home' && pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  borderRadius: 6,
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--color-fg)' : 'var(--color-secondary)',
                  textDecoration: 'none',
                  letterSpacing: '0.005em',
                  userSelect: 'none',
                  transition: 'color 0.15s',
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="agent-nav-active"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 6,
                      background: 'var(--color-accent-bg)',
                      zIndex: -1,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Nav → user area separator */}
        <div style={{ marginRight: 12, width: 1, height: 16, background: 'var(--color-border)', flexShrink: 0 }} />

        {/* User area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <ThemeToggle />

          <button
            onClick={signOut}
            style={{
              padding: '5px 14px',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 5,
              color: 'var(--color-muted)',
              fontSize: '0.75rem', fontWeight: 400,
              cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '0.05em',
              transition: 'border-color 0.18s, color 0.18s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(240, 104, 120, 0.35)';
              e.currentTarget.style.color = 'rgba(240, 104, 120, 0.8)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.color = 'var(--color-muted)';
            }}
          >
            יציאה
          </button>

          {/* Agent avatar */}
          <div style={{
            width: 26, height: 26,
            borderRadius: '50%',
            background: 'var(--color-accent-bg)',
            border: '1px solid rgba(46, 168, 223, 0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-accent)', lineHeight: 1 }}>
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

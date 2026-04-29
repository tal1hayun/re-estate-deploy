'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

const PUBLIC_NAV = [
  { label: 'Properties', href: '#' },
  { label: 'Agents',     href: '#' },
  { label: 'Offers',     href: '#' },
  { label: 'Analytics',  href: '#' },
];

const AUTH_NAV = [
  { label: 'Properties', href: '/properties' },
  { label: 'Agents',     href: '/organization' },
  { label: 'Offers',     href: '#' },
  { label: 'Analytics',  href: '#' },
];

interface Props {
  onLoginClick?: () => void;
  agentInitial?: string;
  onSignOut?: () => void;
}

export default function HomeNavbar({ onLoginClick, agentInitial, onSignOut }: Props) {
  const isAuth = Boolean(agentInitial);
  const navItems = isAuth ? AUTH_NAV : PUBLIC_NAV;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <nav
      dir="ltr"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        height: 52,
        padding: '0 48px',
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', userSelect: 'none' }}>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 200,
            letterSpacing: '0.11em',
            textTransform: 'uppercase',
            color: 'var(--color-secondary)',
          }}>
            re
          </span>
          <span style={{
            fontSize: '0.9375rem',
            fontWeight: 200,
            color: 'var(--color-accent)',
            opacity: 0.6,
            margin: '0 1px',
            letterSpacing: 0,
          }}>
            ·
          </span>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            letterSpacing: '0.11em',
            textTransform: 'uppercase',
            color: 'var(--color-fg)',
          }}>
            estate
          </span>
        </div>

        {/* Live pulse */}
        <span
          className="dot-live"
          style={{
            display: 'inline-block',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: 'var(--color-success)',
            flexShrink: 0,
          }}
        />

        {/* Separator */}
        <div style={{
          marginLeft: 10,
          width: 1,
          height: 16,
          background: 'var(--color-border)',
          flexShrink: 0,
        }} />
      </div>

      {/* Nav items – center */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        position: 'relative',
      }}>
        {navItems.map((item, idx) => (
          <NavItem
            key={item.label}
            label={item.label}
            href={item.href}
            isHovered={hoveredIdx === idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          />
        ))}
      </div>

      {/* User area – right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <ThemeToggle />

        {/* Separator */}
        <div style={{
          width: 1,
          height: 16,
          background: 'var(--color-border)',
          flexShrink: 0,
        }} />

        {isAuth ? (
          <button
            onClick={onSignOut}
            style={{
              padding: '5px 16px',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 5,
              color: 'var(--color-muted)',
              fontSize: '0.75rem',
              fontWeight: 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
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
            Sign out
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            style={{
              padding: '5px 16px',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 5,
              color: 'var(--color-secondary)',
              fontSize: '0.75rem',
              fontWeight: 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.05em',
              transition: 'border-color 0.18s, color 0.18s, background 0.18s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(46, 168, 223, 0.4)';
              e.currentTarget.style.color = 'var(--color-fg)';
              e.currentTarget.style.background = 'var(--color-accent-bg)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.color = 'var(--color-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Sign in
          </button>
        )}

        {/* Avatar */}
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: isAuth ? 'var(--color-accent-bg)' : 'var(--color-surface)',
            border: `1px solid ${isAuth ? 'rgba(46, 168, 223, 0.22)' : 'var(--color-border)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'border-color 0.18s',
          }}
        >
          {isAuth ? (
            <span style={{
              fontSize: '0.625rem',
              fontWeight: 600,
              color: 'var(--color-accent)',
              lineHeight: 1,
            }}>
              {agentInitial}
            </span>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-muted)' }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  label,
  href,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  label: string;
  href: string;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const content = (
    <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {isHovered && (
        <motion.span
          layoutId="home-nav-hover"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 6,
            background: 'var(--color-accent-bg)',
            zIndex: -1,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
      <span style={{
        display: 'block',
        padding: '4px 12px',
        fontSize: '0.8125rem',
        fontWeight: 300,
        letterSpacing: '0.005em',
        color: isHovered ? 'var(--color-fg)' : 'var(--color-secondary)',
        transition: 'color 0.15s',
        userSelect: 'none',
      }}>
        {label}
      </span>
    </span>
  );

  if (href === '#') {
    return (
      <a href="#" style={{ textDecoration: 'none' }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} style={{ textDecoration: 'none' }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {content}
    </Link>
  );
}

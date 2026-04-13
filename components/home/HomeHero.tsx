'use client';

import { useState, useEffect, useRef } from 'react';

const QUICK_ACTIONS = ['Active Listings', 'Pending Review', 'New Leads', 'My Portfolio'];

export default function HomeHero() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘K to focus search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section
      dir="ltr"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Subtle grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: [
            'linear-gradient(rgba(46, 168, 223, 0.035) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(46, 168, 223, 0.035) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '64px 64px',
          zIndex: 0,
        }}
      />

      {/* Radial vignette – fades grid toward edges */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 75% 65% at 50% 50%, transparent 15%, var(--color-bg) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 680,
          padding: '0 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '-40px', // optical center
        }}
      >
        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{ width: 24, height: 1, background: 'rgba(46, 168, 223, 0.35)' }} />
          <span style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            opacity: 0.75,
          }}>
            Property Network
          </span>
          <div style={{ width: 24, height: 1, background: 'rgba(46, 168, 223, 0.35)' }} />
        </div>

        {/* Search bar */}
        <div style={{ width: '100%', position: 'relative' }}>

          {/* Search icon */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              color: focused ? 'var(--color-accent)' : 'var(--color-faint)',
              transition: 'color 0.2s',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search by address, agent, status, or ID..."
            style={{
              width: '100%',
              height: 58,
              padding: '0 76px 0 48px',
              background: 'var(--color-surface)',
              border: `1px solid ${focused ? 'rgba(46, 168, 223, 0.28)' : 'rgba(46, 168, 223, 0.11)'}`,
              borderRadius: 10,
              color: 'var(--color-fg)',
              fontSize: '0.9375rem',
              fontWeight: 400,
              fontFamily: 'inherit',
              letterSpacing: '-0.01em',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: focused
                ? '0 0 0 3px rgba(46, 168, 223, 0.05), 0 8px 32px rgba(0,0,0,0.35)'
                : '0 4px 20px rgba(0,0,0,0.25)',
            }}
          />

          {/* ⌘K hint */}
          {!focused && !query && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                gap: 3,
                pointerEvents: 'none',
              }}
            >
              {['⌘', 'K'].map(k => (
                <kbd
                  key={k}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px 6px',
                    background: 'var(--color-surface-2)',
                    border: '1px solid rgba(46, 168, 223, 0.09)',
                    borderRadius: 4,
                    color: 'var(--color-faint)',
                    fontSize: '0.6875rem',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                  }}
                >
                  {k}
                </kbd>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{
          marginTop: 16,
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {QUICK_ACTIONS.map(label => (
            <QuickAction key={label} label={label} />
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickAction({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '5px 14px',
        background: hovered ? 'rgba(46, 168, 223, 0.05)' : 'transparent',
        border: `1px solid ${hovered ? 'rgba(46, 168, 223, 0.22)' : 'rgba(46, 168, 223, 0.09)'}`,
        borderRadius: 5,
        color: hovered ? 'var(--color-fg)' : 'var(--color-muted)',
        fontSize: '0.8125rem',
        fontWeight: 400,
        cursor: 'pointer',
        fontFamily: 'inherit',
        letterSpacing: '-0.01em',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

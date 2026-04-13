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
      {/* Grid – slightly quieter */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: [
            'linear-gradient(rgba(46, 168, 223, 0.028) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(46, 168, 223, 0.028) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '56px 56px',
          zIndex: 0,
        }}
      />

      {/* Radial vignette */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 10%, var(--color-bg) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 760,
          padding: '0 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '-48px', // optical center
        }}
      >
        {/* Eyebrow – precise and quiet */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <div style={{ width: 36, height: 1, background: 'rgba(46, 168, 223, 0.18)' }} />
          <span style={{
            fontSize: '0.625rem',
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            opacity: 0.45,
          }}>
            Property Network
          </span>
          <div style={{ width: 36, height: 1, background: 'rgba(46, 168, 223, 0.18)' }} />
        </div>

        {/* Search bar – large, commanding */}
        <div style={{ width: '100%', position: 'relative' }}>

          {/* Search icon */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              color: focused ? 'rgba(46, 168, 223, 0.55)' : 'rgba(46, 168, 223, 0.22)',
              transition: 'color 0.25s',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
              height: 68,
              padding: '0 92px 0 58px',
              background: 'var(--color-surface)',
              border: `1px solid ${focused ? 'rgba(46, 168, 223, 0.28)' : 'rgba(46, 168, 223, 0.09)'}`,
              borderRadius: 12,
              color: 'var(--color-fg)',
              fontSize: '1rem',
              fontWeight: 300,
              fontFamily: 'inherit',
              letterSpacing: '-0.01em',
              outline: 'none',
              transition: 'border-color 0.25s, box-shadow 0.25s',
              boxShadow: focused
                ? '0 0 0 4px rgba(46, 168, 223, 0.055), 0 20px 60px rgba(0,0,0,0.5)'
                : '0 8px 40px rgba(0,0,0,0.4)',
            }}
          />

          {/* ⌘K hint */}
          {!focused && !query && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                right: 18,
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
                    padding: '3px 7px',
                    background: 'rgba(10, 26, 34, 0.7)',
                    border: '1px solid rgba(46, 168, 223, 0.07)',
                    borderRadius: 4,
                    color: 'rgba(46, 168, 223, 0.22)',
                    fontSize: '0.625rem',
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    letterSpacing: '0.05em',
                  }}
                >
                  {k}
                </kbd>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions – commands, not buttons */}
        <div style={{
          marginTop: 24,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {QUICK_ACTIONS.map((label, i) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center' }}>
              <QuickAction label={label} />
              {i < QUICK_ACTIONS.length - 1 && (
                <span
                  aria-hidden
                  style={{
                    color: 'rgba(46, 168, 223, 0.1)',
                    fontSize: '0.75rem',
                    padding: '0 4px',
                    userSelect: 'none',
                  }}
                >
                  ·
                </span>
              )}
            </span>
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
        padding: '5px 10px',
        background: 'transparent',
        border: 'none',
        color: hovered ? 'rgba(240, 244, 246, 0.6)' : 'rgba(122, 154, 170, 0.38)',
        fontSize: '0.75rem',
        fontWeight: 400,
        cursor: 'pointer',
        fontFamily: 'inherit',
        letterSpacing: '0.015em',
        transition: 'color 0.2s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

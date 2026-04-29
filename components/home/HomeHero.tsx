'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const QUICK_ACTIONS = ['active listings', 'pending review', 'new leads', 'my portfolio'];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

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
      {/* Layer 0 – Grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: [
            'linear-gradient(rgba(46, 168, 223, 0.026) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(46, 168, 223, 0.026) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '56px 56px',
          zIndex: 0,
        }}
      />

      {/* Layer 1 – Ambient center glow */}
      <div
        aria-hidden
        className="glow-wake"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 52% 28% at 50% 56%, rgba(46, 168, 223, 0.048) 0%, transparent 100%)',
          zIndex: 1,
        }}
      />

      {/* Layer 2 – Radial vignette */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 10%, var(--color-bg) 100%)',
          zIndex: 2,
        }}
      />

      {/* Layer 3 – Depth gradient */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(4, 8, 12, 0.22) 0%, transparent 18%, transparent 82%, rgba(4, 8, 12, 0.15) 100%)',
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 760,
          padding: '0 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '-48px',
        }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE_OUT_EXPO, delay: 0.05 }}
          style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}
        >
          <div style={{ width: 36, height: 1, background: 'rgba(46, 168, 223, 0.16)' }} />
          <h1 style={{
            fontSize: '0.625rem',
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            opacity: 0.55,
            margin: 0,
          }}>
            Property Network
          </h1>
          <div style={{ width: 36, height: 1, background: 'rgba(46, 168, 223, 0.16)' }} />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE_OUT_EXPO, delay: 0.14 }}
          style={{
            fontSize: '0.75rem',
            fontWeight: 300,
            color: 'rgba(240, 244, 246, 0.28)',
            letterSpacing: '0.06em',
            margin: '0 0 36px',
            textAlign: 'center',
            lineHeight: 1,
          }}
        >
          From listing to close.
        </motion.p>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE_OUT_EXPO, delay: 0.22 }}
          className="search-glow"
          style={{ width: '100%', position: 'relative' }}
        >
          {/* Search icon */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              color: focused ? 'rgba(46, 168, 223, 0.55)' : 'rgba(46, 168, 223, 0.2)',
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
              background: focused ? 'rgba(10, 26, 34, 1)' : 'rgba(10, 26, 34, 0.92)',
              border: `1px solid ${focused ? 'rgba(46, 168, 223, 0.3)' : 'rgba(46, 168, 223, 0.09)'}`,
              borderRadius: 12,
              color: 'var(--color-fg)',
              fontSize: '1rem',
              fontWeight: 300,
              fontFamily: 'inherit',
              letterSpacing: '-0.01em',
              outline: 'none',
              transition: 'border-color 0.25s, box-shadow 0.25s, background 0.25s',
              boxShadow: focused
                ? '0 0 0 4px rgba(46, 168, 223, 0.055), inset 0 1px 2px rgba(0,0,0,0.4)'
                : 'inset 0 1px 2px rgba(0,0,0,0.3)',
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
                    color: 'rgba(46, 168, 223, 0.2)',
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
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE_OUT_EXPO, delay: 0.32 }}
          style={{
            marginTop: 24,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {QUICK_ACTIONS.map((label, i) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center' }}>
              <button className="quick-action">{label}</button>
              {i < QUICK_ACTIONS.length - 1 && (
                <span
                  aria-hidden
                  style={{
                    color: 'rgba(46, 168, 223, 0.09)',
                    fontSize: '0.75rem',
                    padding: '0 2px',
                    userSelect: 'none',
                  }}
                >
                  ·
                </span>
              )}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

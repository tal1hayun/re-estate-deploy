'use client';

const NAV_ITEMS = ['Properties', 'Agents', 'Offers', 'Analytics'];

interface Props {
  onLoginClick?: () => void;
}

export default function HomeNavbar({ onLoginClick }: Props) {
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
        background: 'rgba(6, 15, 20, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(46, 168, 223, 0.055)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
        {/* Wordmark – light/heavy contrast */}
        <div style={{ display: 'flex', alignItems: 'baseline', userSelect: 'none' }}>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 200,
            letterSpacing: '0.11em',
            textTransform: 'uppercase',
            color: 'rgba(240, 244, 246, 0.55)',
          }}>
            re
          </span>
          <span style={{
            fontSize: '0.9375rem',
            fontWeight: 200,
            color: 'var(--color-accent)',
            opacity: 0.5,
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
            color: 'rgba(240, 244, 246, 0.92)',
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
          background: 'rgba(46, 168, 223, 0.08)',
          flexShrink: 0,
        }} />
      </div>

      {/* Nav items – center */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 48,
      }}>
        {NAV_ITEMS.map(item => (
          <NavItem key={item} label={item} />
        ))}
      </div>

      {/* User area – right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
        {/* Separator */}
        <div style={{
          marginRight: 4,
          width: 1,
          height: 16,
          background: 'rgba(46, 168, 223, 0.08)',
          flexShrink: 0,
        }} />

        <button
          onClick={onLoginClick}
          style={{
            padding: '5px 16px',
            background: 'transparent',
            border: '1px solid rgba(46, 168, 223, 0.15)',
            borderRadius: 5,
            color: 'rgba(122, 154, 170, 0.62)',
            fontSize: '0.75rem',
            fontWeight: 400,
            cursor: 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '0.05em',
            transition: 'border-color 0.18s, color 0.18s, background 0.18s, box-shadow 0.18s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.borderColor = 'rgba(46, 168, 223, 0.38)';
            el.style.color = 'rgba(240, 244, 246, 0.85)';
            el.style.background = 'rgba(46, 168, 223, 0.04)';
            el.style.boxShadow = '0 0 12px rgba(46, 168, 223, 0.08)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.borderColor = 'rgba(46, 168, 223, 0.15)';
            el.style.color = 'rgba(122, 154, 170, 0.62)';
            el.style.background = 'transparent';
            el.style.boxShadow = 'none';
          }}
        >
          Sign in
        </button>

        {/* Avatar */}
        <div style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: 'rgba(10, 26, 34, 0.9)',
          border: '1px solid rgba(46, 168, 223, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          transition: 'border-color 0.18s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(46, 168, 223, 0.22)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(46, 168, 223, 0.08)'}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'rgba(74, 106, 122, 0.75)' }}
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>
    </nav>
  );
}

function NavItem({ label }: { label: string }) {
  return (
    <a
      href="#"
      className="nav-link"
      style={{
        fontSize: '0.8125rem',
        fontWeight: 300,
        textDecoration: 'none',
        letterSpacing: '0.005em',
        padding: '4px 0',
        userSelect: 'none',
      }}
    >
      {label}
    </a>
  );
}

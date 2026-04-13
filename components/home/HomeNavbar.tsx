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
        background: 'rgba(6, 15, 20, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(46, 168, 223, 0.06)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
        <span style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--color-fg)',
          userSelect: 'none',
          opacity: 0.92,
        }}>
          re
          <span style={{
            color: 'var(--color-accent)',
            fontWeight: 200,
            fontSize: '1.2em',
            letterSpacing: 0,
            opacity: 0.7,
          }}>·</span>
          estate
        </span>
        {/* Live indicator */}
        <span style={{
          display: 'inline-block',
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'var(--color-success)',
          boxShadow: '0 0 5px var(--color-success)',
          flexShrink: 0,
          opacity: 0.8,
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
        <button
          onClick={onLoginClick}
          style={{
            padding: '5px 16px',
            background: 'transparent',
            border: '1px solid rgba(46, 168, 223, 0.18)',
            borderRadius: 5,
            color: 'rgba(122, 154, 170, 0.7)',
            fontSize: '0.75rem',
            fontWeight: 400,
            cursor: 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '0.04em',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.borderColor = 'rgba(46, 168, 223, 0.4)';
            el.style.color = 'var(--color-fg)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.borderColor = 'rgba(46, 168, 223, 0.18)';
            el.style.color = 'rgba(122, 154, 170, 0.7)';
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
          border: '1px solid rgba(46, 168, 223, 0.09)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'rgba(74, 106, 122, 0.8)' }}
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
      style={{
        fontSize: '0.8125rem',
        fontWeight: 300,
        color: 'rgba(122, 154, 170, 0.65)',
        textDecoration: 'none',
        letterSpacing: '0.005em',
        transition: 'color 0.15s',
        padding: '4px 0',
        userSelect: 'none',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240, 244, 246, 0.9)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(122, 154, 170, 0.65)'}
    >
      {label}
    </a>
  );
}

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
        height: 56,
        padding: '0 40px',
        background: 'rgba(6, 15, 20, 0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(46, 168, 223, 0.07)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span style={{
          fontSize: '0.9375rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--color-fg)',
          userSelect: 'none',
        }}>
          re
          <span style={{ color: 'var(--color-accent)', fontWeight: 300, fontSize: '1.15em', letterSpacing: 0 }}>·</span>
          estate
        </span>
        {/* Live pulse */}
        <span style={{
          display: 'inline-block',
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: 'var(--color-success)',
          boxShadow: '0 0 6px var(--color-success)',
          flexShrink: 0,
        }} />
      </div>

      {/* Nav items – center */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 36,
      }}>
        {NAV_ITEMS.map(item => (
          <NavItem key={item} label={item} />
        ))}
      </div>

      {/* User area – right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button
          onClick={onLoginClick}
          style={{
            padding: '6px 18px',
            background: 'transparent',
            border: '1px solid rgba(46, 168, 223, 0.22)',
            borderRadius: 6,
            color: 'var(--color-secondary)',
            fontSize: 'var(--text-sm)',
            fontWeight: 400,
            cursor: 'pointer',
            fontFamily: 'inherit',
            letterSpacing: '-0.01em',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.borderColor = 'rgba(46, 168, 223, 0.5)';
            el.style.color = 'var(--color-fg)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.borderColor = 'rgba(46, 168, 223, 0.22)';
            el.style.color = 'var(--color-secondary)';
          }}
        >
          Sign in
        </button>

        {/* Avatar */}
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--color-surface-2)',
          border: '1px solid rgba(46, 168, 223, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--color-muted)' }}
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
        fontSize: 'var(--text-sm)',
        fontWeight: 400,
        color: 'var(--color-secondary)',
        textDecoration: 'none',
        letterSpacing: '-0.01em',
        transition: 'color 0.15s',
        padding: '4px 0',
        userSelect: 'none',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-fg)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--color-secondary)'}
    >
      {label}
    </a>
  );
}

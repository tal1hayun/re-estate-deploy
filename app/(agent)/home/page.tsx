'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconMessage() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function IconDeal() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

// ── Section tiles ──────────────────────────────────────────────────────────────
const TILES = [
  {
    id: 'properties',
    label: 'Properties',
    desc: 'Active listings and pipeline status',
    href: '/properties',
    icon: <IconGrid />,
    available: true,
    span: 2,
  },
  {
    id: 'agents',
    label: 'Agents',
    desc: 'Team members and access',
    href: '/organization',
    icon: <IconUsers />,
    available: true,
    span: 2,
  },
  {
    id: 'messages',
    label: 'Messages',
    desc: 'Client and team communications',
    href: '/messages',
    icon: <IconMessage />,
    available: true,
    span: 2,
  },
  {
    id: 'offers',
    label: 'Offers',
    desc: 'Deal pipeline and negotiations',
    href: '#',
    icon: <IconDeal />,
    available: false,
    span: 3,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    desc: 'Performance and conversion insights',
    href: '#',
    icon: <IconChart />,
    available: false,
    span: 3,
  },
];

// ── Architectural floor-plan illustration ─────────────────────────────────────
function FloorPlanSVG() {
  const stroke = 'rgba(46,168,223,1)';
  return (
    <svg width="520" height="400" viewBox="0 0 520 400" fill="none">
      {/* Outer boundary */}
      <rect x="20" y="20" width="480" height="360" stroke={stroke} strokeWidth="0.75" />

      {/* Horizontal room dividers */}
      <line x1="20" y1="148" x2="300" y2="148" stroke={stroke} strokeWidth="0.5" />
      <line x1="20" y1="272" x2="500" y2="272" stroke={stroke} strokeWidth="0.5" />

      {/* Vertical room dividers */}
      <line x1="300" y1="20" x2="300" y2="248" stroke={stroke} strokeWidth="0.5" />
      <line x1="380" y1="148" x2="380" y2="272" stroke={stroke} strokeWidth="0.5" />
      <line x1="170" y1="272" x2="170" y2="380" stroke={stroke} strokeWidth="0.5" />
      <line x1="340" y1="272" x2="340" y2="380" stroke={stroke} strokeWidth="0.5" />

      {/* Window indicators (short ticks perpendicular to walls) */}
      <line x1="80"  y1="20" x2="80"  y2="30" stroke={stroke} strokeWidth="0.5" />
      <line x1="120" y1="20" x2="120" y2="30" stroke={stroke} strokeWidth="0.5" />
      <line x1="200" y1="20" x2="200" y2="30" stroke={stroke} strokeWidth="0.5" />
      <line x1="240" y1="20" x2="240" y2="30" stroke={stroke} strokeWidth="0.5" />
      <line x1="360" y1="20" x2="360" y2="30" stroke={stroke} strokeWidth="0.5" />
      <line x1="440" y1="20" x2="440" y2="30" stroke={stroke} strokeWidth="0.5" />

      {/* Side window ticks */}
      <line x1="500" y1="90"  x2="490" y2="90"  stroke={stroke} strokeWidth="0.5" />
      <line x1="500" y1="190" x2="490" y2="190" stroke={stroke} strokeWidth="0.5" />
      <line x1="500" y1="320" x2="490" y2="320" stroke={stroke} strokeWidth="0.5" />
      <line x1="20"  y1="80"  x2="30"  y2="80"  stroke={stroke} strokeWidth="0.5" />
      <line x1="20"  y1="320" x2="30"  y2="320" stroke={stroke} strokeWidth="0.5" />

      {/* Corner accent dots */}
      <circle cx="20"  cy="20"  r="2.5" fill={stroke} />
      <circle cx="500" cy="20"  r="2.5" fill={stroke} />
      <circle cx="20"  cy="380" r="2.5" fill={stroke} />
      <circle cx="500" cy="380" r="2.5" fill={stroke} />

      {/* Intersection dots */}
      <circle cx="300" cy="20"  r="1.5" fill={stroke} />
      <circle cx="300" cy="148" r="1.5" fill={stroke} />
      <circle cx="20"  cy="148" r="1.5" fill={stroke} />
      <circle cx="300" cy="248" r="1.5" fill={stroke} />
      <circle cx="380" cy="148" r="1.5" fill={stroke} />
      <circle cx="380" cy="272" r="1.5" fill={stroke} />
      <circle cx="20"  cy="272" r="1.5" fill={stroke} />
      <circle cx="500" cy="272" r="1.5" fill={stroke} />
      <circle cx="170" cy="272" r="1.5" fill={stroke} />
      <circle cx="170" cy="380" r="1.5" fill={stroke} />
      <circle cx="340" cy="272" r="1.5" fill={stroke} />
      <circle cx="340" cy="380" r="1.5" fill={stroke} />
    </svg>
  );
}

// ── Tile component ─────────────────────────────────────────────────────────────
function Tile({ label, desc, href, icon, available, span }: {
  label: string; desc: string; href: string;
  icon: React.ReactNode; available: boolean; span: number;
}) {
  const content = (
    <>
      <div className="home-tile-icon">{icon}</div>
      <h3 style={{
        fontSize: '0.9375rem', fontWeight: 500,
        color: 'rgba(240, 244, 246, 0.86)',
        margin: '0 0 7px', letterSpacing: '-0.01em',
      }}>
        {label}
      </h3>
      <p style={{
        fontSize: '0.8125rem', fontWeight: 300,
        color: 'rgba(122, 154, 170, 0.5)',
        margin: 0, lineHeight: 1.55,
      }}>
        {desc}
      </p>
      <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: available ? 'flex-end' : 'flex-start' }}>
        {available ? (
          <span style={{ color: 'rgba(46, 168, 223, 0.25)', transition: 'color 0.22s ease' }}>
            <IconArrow />
          </span>
        ) : (
          <span style={{
            fontSize: '0.5625rem', fontWeight: 500, letterSpacing: '0.08em',
            textTransform: 'uppercase', color: 'rgba(46, 168, 223, 0.3)',
            border: '1px solid rgba(46, 168, 223, 0.15)',
            borderRadius: 3, padding: '2px 6px',
          }}>
            Soon
          </span>
        )}
      </div>
    </>
  );

  if (!available) {
    return (
      <div style={{ gridColumn: `span ${span}` }}>
        <div className="home-tile" style={{ opacity: 0.38, cursor: 'default', pointerEvents: 'none' }}>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <Link href={href} className="home-tile">
        {content}
      </Link>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function InternalHomePage() {
  const { agent, organization } = useAuth();
  const firstName = agent?.full_name?.split(' ')[0] ?? '';

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: 'var(--color-bg)', position: 'relative', overflow: 'hidden' }}>

      {/* Grid texture */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: [
            'linear-gradient(rgba(46, 168, 223, 0.02) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(46, 168, 223, 0.02) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '56px 56px',
        }}
      />

      {/* Architectural illustration — top-right, very faint */}
      <div
        aria-hidden
        style={{
          position: 'absolute', top: '4%', right: '-3%',
          opacity: 0.038, pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <FloorPlanSVG />
      </div>

      {/* Ambient glow — left-center, where the header text lives */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 55% 45% at 28% 35%, rgba(46, 168, 223, 0.034) 0%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1100, margin: '0 auto',
        padding: '72px 48px 80px',
      }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 60 }}>
          <p style={{
            fontSize: '0.625rem', fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--color-accent)', opacity: 0.42,
            margin: '0 0 16px',
          }}>
            Property Network
          </p>
          <h1 style={{
            fontSize: '2rem', fontWeight: 300,
            color: 'rgba(240, 244, 246, 0.88)',
            margin: '0 0 10px',
            letterSpacing: '-0.025em', lineHeight: 1.15,
          }}>
            {getGreeting()}{firstName ? `, ${firstName}` : ''}.
          </h1>
          {organization && (
            <p style={{
              fontSize: '0.875rem', fontWeight: 300,
              color: 'rgba(122, 154, 170, 0.45)',
              margin: 0, letterSpacing: '0.01em',
            }}>
              {organization.name}
            </p>
          )}
        </div>

        {/* ── Section tiles ── */}
        {/* 6-column grid: available tiles span 2 cols each (3 per row), coming-soon span 3 cols each (2 per row) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
          {TILES.map(tile => (
            <Tile key={tile.id} {...tile} />
          ))}
        </div>

      </div>
    </div>
  );
}

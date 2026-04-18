'use client';

export default function AnalyticsPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: 'var(--color-bg)', position: 'relative', overflow: 'hidden' }}>

      {/* Grid texture */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: [
          'linear-gradient(rgba(46, 168, 223, 0.02) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(46, 168, 223, 0.02) 1px, transparent 1px)',
        ].join(', '),
        backgroundSize: '56px 56px',
      }} />

      {/* Ambient glow */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 55% 45% at 28% 35%, rgba(46, 168, 223, 0.03) 0%, transparent 100%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '72px 48px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <p style={{
            fontSize: '0.625rem', fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'var(--color-accent)', opacity: 0.42,
            margin: '0 0 16px',
          }}>
            נתוני ביצועים
          </p>
          <h1 style={{
            fontSize: '2rem', fontWeight: 300,
            color: 'rgba(240, 244, 246, 0.88)',
            margin: 0, letterSpacing: '-0.025em', lineHeight: 1.15,
          }}>
            אנליטיקה
          </h1>
        </div>

        {/* Empty state */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: 280,
          border: '1px solid rgba(46, 168, 223, 0.07)',
          borderRadius: 14,
          background: 'rgba(10, 26, 34, 0.45)',
          gap: 12,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(46,168,223,0.2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <p style={{
            fontSize: '0.875rem', fontWeight: 300,
            color: 'rgba(122, 154, 170, 0.35)',
            margin: 0, letterSpacing: '0.01em',
          }}>
            אין נתונים עדיין
          </p>
        </div>

      </div>
    </div>
  );
}

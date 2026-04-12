'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties, type PropertyFull } from '@/hooks/useProperties';

interface Stats {
  activeProperties: number;
  unreadMessages: number;
  activeLinks: number;
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}
function IconHome() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.18 }}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
function coverImgUrl(images: PropertyFull['property_images']) {
  const img = images?.find(i => i.is_cover) || images?.[0];
  if (!img) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/property-images/${img.storage_path}`;
}
function fmtPrice(p: number) { return '₪' + p.toLocaleString('he-IL'); }

const STATUS_LABEL: Record<string, string> = { active: 'פעיל', sold: 'נמכר', inactive: 'לא פעיל' };

// ── Tab group ──────────────────────────────────────────────────────────────────
type TabKey = 'mine' | 'all';
function TabGroup({ tab, onChange }: { tab: TabKey; onChange: (t: TabKey) => void }) {
  const items: { key: TabKey; label: string }[] = [
    { key: 'mine', label: 'נכסים אישיים' },
    { key: 'all',  label: 'כל הנכסים הפעילים' },
  ];
  return (
    <div style={{
      display: 'inline-flex',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 8, padding: 3, gap: 2,
    }}>
      {items.map(item => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          style={{
            padding: '6px 16px', borderRadius: 6, border: 'none',
            background: tab === item.key ? 'var(--color-surface-3)' : 'transparent',
            color: tab === item.key ? 'var(--color-fg)' : 'var(--color-muted)',
            fontSize: 'var(--text-xs)', fontWeight: tab === item.key ? 600 : 400,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
            letterSpacing: '0.02em',
            borderBottom: tab === item.key ? '1px solid rgba(46,168,223,0.35)' : '1px solid transparent',
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ── Property mini-card ─────────────────────────────────────────────────────────
function PropertyCard({ property }: { property: PropertyFull }) {
  const imgUrl = coverImgUrl(property.property_images);
  return (
    <Link
      href={`/properties/${property.id}`}
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12, overflow: 'hidden',
        textDecoration: 'none',
        transition: 'border-color 0.2s, transform 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(46,168,223,0.35)';
        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Image */}
      <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--color-surface-2)', overflow: 'hidden', position: 'relative' }}>
        {imgUrl ? (
          <img src={imgUrl} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconHome />
          </div>
        )}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <span
            className={
              property.status === 'active' ? 'status-active' :
              property.status === 'sold' ? 'status-sold' : 'status-inactive'
            }
            style={{ background: 'rgba(6,15,20,0.75)', backdropFilter: 'blur(8px)', padding: '2px 8px', borderRadius: 4 }}
          >
            {STATUS_LABEL[property.status]}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-fg)', marginBottom: 4, lineHeight: 1.3 }}>
          {property.title}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginBottom: 8 }}>
          {property.city}
          {property.agents?.full_name && (
            <span style={{ marginRight: 6, color: 'var(--color-faint)' }}>· {property.agents.full_name}</span>
          )}
        </div>
        <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-accent)' }}>
          {fmtPrice(property.current_price)}
        </div>
      </div>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { agent, organization } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const { properties, loading: propsLoading } = useProperties();
  const [tab, setTab] = useState<TabKey>('mine');

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    fetch('/api/dashboard/stats', { signal: controller.signal })
      .then(r => r.json())
      .then(json => { if (!json.error) setStats(json); })
      .catch(() => { /* stats fall back to '—' gracefully */ })
      .finally(() => clearTimeout(timer));
    return () => { controller.abort(); clearTimeout(timer); };
  }, []);

  const statItems = [
    { label: 'נכסים פעילים',    value: stats?.activeProperties ?? '—' },
    { label: 'הודעות שלא נקראו', value: stats?.unreadMessages   ?? '—' },
    { label: 'קישורים פעילים',   value: stats?.activeLinks      ?? '—' },
  ];

  const firstName = agent?.full_name?.split(' ')[0] || 'סוכן';

  // Tab content
  const myProperties     = properties.filter(p => p.agent_id === agent?.id);
  const activeProperties = properties.filter(p => p.status === 'active');
  const displayed = (tab === 'mine' ? myProperties : activeProperties).slice(0, 6);
  const displayCount = tab === 'mine' ? myProperties.length : activeProperties.length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px' }}>

      {/* Greeting */}
      <div style={{ marginBottom: 40 }}>
        <p style={{
          fontSize: 'var(--text-xs)', color: 'var(--color-muted)',
          fontWeight: 500, marginBottom: 8,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          ברוך הבא
        </p>
        <h1 style={{
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700,
          color: 'var(--color-fg)', lineHeight: 1.1, letterSpacing: '-0.025em',
        }}>
          שלום, <span style={{ color: 'var(--color-accent)' }}>{firstName}</span>
        </h1>
        {organization && (
          <p style={{ marginTop: 8, fontSize: 'var(--text-sm)', color: 'var(--color-secondary)', fontWeight: 300 }}>
            {organization.name}
          </p>
        )}
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1, background: 'var(--color-border)',
        borderRadius: 12, overflow: 'hidden',
        marginBottom: 40, border: '1px solid var(--color-border)',
      }}>
        {statItems.map((s, i) => (
          <div key={i} style={{ background: 'var(--color-surface)', padding: '28px 28px 24px', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, left: 0, height: 2,
              background: i === 0 ? 'var(--color-accent)' : 'var(--color-border)',
              opacity: i === 0 ? 0.7 : 0.5,
            }}/>
            <div style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700,
              color: 'var(--color-accent)', letterSpacing: '-0.02em',
              lineHeight: 1, marginBottom: 10, fontVariantNumeric: 'tabular-nums',
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-secondary)', fontWeight: 500, letterSpacing: '0.03em' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Properties Tabs Panel ─────────────────────────────────────────── */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 14, marginBottom: 28, overflow: 'hidden',
      }}>
        {/* Panel header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--color-border)',
          flexWrap: 'wrap', gap: 12,
        }}>
          <TabGroup tab={tab} onChange={setTab} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
              {propsLoading ? '...' : `${displayCount} נכסים`}
            </span>
            <Link
              href={tab === 'mine' ? '/properties?filter=mine' : '/properties'}
              style={{
                fontSize: 'var(--text-xs)', color: 'var(--color-accent)',
                textDecoration: 'none', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              ראה הכל <IconArrow />
            </Link>
          </div>
        </div>

        {/* Panel body */}
        <div style={{ padding: '20px 24px' }}>
          {propsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div className="spinner" />
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-muted)' }}>
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}><IconHome /></div>
              <p style={{ fontSize: 'var(--text-sm)' }}>
                {tab === 'mine' ? 'טרם הוספת נכסים' : 'אין נכסים פעילים כרגע'}
              </p>
              {tab === 'mine' && (
                <Link href="/properties/new" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: 16, fontSize: 'var(--text-sm)' }}>
                  <IconPlus /> הוסף נכס ראשון
                </Link>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 16,
            }}>
              {displayed.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Bottom grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>

        {/* Quick Actions */}
        <div className="card-surface" style={{ padding: '28px 24px' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-fg)', marginBottom: 20 }}>
            פעולות מהירות
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link
              href="/properties/new"
              className="btn-primary"
              style={{ textDecoration: 'none', justifyContent: 'space-between', padding: '12px 16px', fontSize: 'var(--text-sm)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconPlus />הוסף נכס חדש
              </span>
              <IconArrow />
            </Link>
            {[
              { href: '/properties', label: 'כל הנכסים' },
              { href: '/messages',   label: 'הודעות לקוחות' },
            ].map(a => (
              <Link
                key={a.href}
                href={a.href}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 16px',
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8, textDecoration: 'none',
                  color: 'var(--color-secondary)', fontSize: 'var(--text-sm)',
                  fontWeight: 400, transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(46,168,223,0.25)';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-fg)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-secondary)';
                }}
              >
                {a.label}<IconArrow />
              </Link>
            ))}
          </div>
        </div>

        {/* Office Info */}
        <div className="card-surface" style={{ padding: '28px 24px' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-fg)', marginBottom: 20 }}>
            פרטי המשרד
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { label: 'שם המשרד', value: organization?.name || '—' },
              { label: 'תפקיד',    value: agent?.role === 'admin' ? 'מנהל' : 'סוכן' },
              { label: 'אימייל',   value: agent?.email || '—' },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--color-border-soft)' : 'none',
                }}
              >
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', fontWeight: 400 }}>{row.label}</span>
                <span style={{
                  fontSize: 'var(--text-sm)',
                  color: row.label === 'תפקיד' && agent?.role === 'admin' ? 'var(--color-accent)' : 'var(--color-fg)',
                  fontWeight: 500,
                  direction: row.label === 'אימייל' ? 'ltr' : 'rtl',
                }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

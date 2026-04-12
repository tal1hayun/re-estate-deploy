'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import type { PropertyImage } from '@/types';

function IconPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function IconHome() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.18 }}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function TabGroup<T extends string>({ items, value, onChange }: { items: { key: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      padding: 3,
      gap: 2,
    }}>
      {items.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: '5px 14px',
            borderRadius: 6,
            border: 'none',
            background: value === tab.key ? 'var(--color-surface-3)' : 'transparent',
            color: value === tab.key ? 'var(--color-fg)' : 'var(--color-muted)',
            fontSize: 'var(--text-xs)',
            fontWeight: value === tab.key ? 600 : 400,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
            letterSpacing: '0.02em',
            borderBottom: value === tab.key ? '1px solid rgba(46,168,223,0.3)' : '1px solid transparent',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default function PropertiesPage() {
  const { agent } = useAuth();
  const isAdmin = agent?.role === 'admin';
  const { properties, loading } = useProperties();
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sold' | 'inactive'>('all');

  const filtered = properties.filter(p => {
    if (filter === 'mine' && p.agent_id !== agent?.id) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  function formatPrice(price: number) {
    return '₪' + price.toLocaleString('he-IL');
  }

  function getCoverImage(images: PropertyImage[]) {
    const cover = images?.find(i => i.is_cover) || images?.[0];
    if (!cover) return null;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-images/${cover.storage_path}`;
  }

  const statusLabel: Record<string, string> = { active: 'פעיל', sold: 'נמכר', inactive: 'לא פעיל' };

  const filterTabs: { key: 'all' | 'mine'; label: string }[] = [
    { key: 'all', label: 'כל הנכסים' },
    { key: 'mine', label: 'נכסים אישיים' },
  ];

  const statusTabs: { key: 'all' | 'active' | 'sold' | 'inactive'; label: string }[] = [
    { key: 'all', label: 'הכל' },
    { key: 'active', label: 'פעיל' },
    { key: 'sold', label: 'נמכר' },
    { key: 'inactive', label: 'לא פעיל' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 32, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: 'var(--color-fg)',
            letterSpacing: '-0.02em',
            marginBottom: 4,
          }}>
            נכסים
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', fontWeight: 400 }}>
            {filtered.length} נכסים{filter === 'mine' ? ' · אישיים' : ''}{statusFilter !== 'all' ? ` · ${statusLabel[statusFilter]}` : ''}
          </p>
        </div>
        <Link
          href="/properties/new"
          className="btn-primary"
          style={{ textDecoration: 'none', gap: 8, padding: '10px 20px', fontSize: 'var(--text-sm)' }}
        >
          <IconPlus />
          נכס חדש
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <TabGroup items={filterTabs} value={filter} onChange={setFilter} />
        <TabGroup items={statusTabs} value={statusFilter} onChange={setStatusFilter} />
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
          <div className="spinner"/>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
            <IconHome />
          </div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-fg)', marginBottom: 8 }}>
            אין נכסים עדיין
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 28 }}>
            הוסף את הנכס הראשון שלך
          </p>
          <Link href="/properties/new" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
            הוסף נכס חדש
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}>
          {filtered.map(property => {
            const coverUrl = getCoverImage(property.property_images);
            const isOwn = property.agent_id === agent?.id;
            return (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(46,168,223,0.3)';
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-border)';
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                }}
              >
                {/* Image */}
                <div style={{ height: 192, background: 'var(--color-surface-2)', position: 'relative', overflow: 'hidden' }}>
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={property.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                      onMouseEnter={e => (e.target as HTMLImageElement).style.transform = 'scale(1.04)'}
                      onMouseLeave={e => (e.target as HTMLImageElement).style.transform = 'scale(1)'}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <IconHome />
                    </div>
                  )}

                  {/* Status badge */}
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8 }}>
                    <span
                      className={
                        property.status === 'active' ? 'status-active' :
                        property.status === 'sold' ? 'status-sold' : 'status-inactive'
                      }
                      style={{
                        background: 'rgba(6,15,20,0.75)',
                        backdropFilter: 'blur(8px)',
                        padding: '3px 8px',
                        borderRadius: 4,
                        border: property.status === 'active' ? '1px solid rgba(61,214,140,0.25)' :
                                property.status === 'sold' ? '1px solid rgba(122,154,170,0.25)' : '1px solid transparent',
                      }}
                    >
                      {statusLabel[property.status]}
                    </span>
                    {!isOwn && property.agents?.full_name && (
                      <span style={{
                        background: 'rgba(6,15,20,0.75)',
                        backdropFilter: 'blur(8px)',
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: 'var(--text-xs)',
                        fontWeight: 500,
                        color: 'var(--color-secondary)',
                        border: '1px solid rgba(122,154,170,0.2)',
                      }}>
                        {property.agents.full_name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: '16px 18px 18px' }}>
                  <h3 style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 600,
                    color: 'var(--color-fg)',
                    marginBottom: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {property.title}
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-muted)',
                    marginBottom: 14,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {property.city} · {property.address}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 700,
                      color: 'var(--color-accent)',
                      letterSpacing: '-0.01em',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {formatPrice(property.current_price)}
                    </span>
                    {(isOwn || isAdmin) && (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', fontWeight: 400 }}>
                        ניתן לעריכה
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

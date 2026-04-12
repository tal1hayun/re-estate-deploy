'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
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
function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function IconX() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
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

type SortKey = 'date-new' | 'date-old' | 'price-asc' | 'price-desc' | 'name';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'date-new', label: 'חדש ביותר' },
  { key: 'date-old', label: 'ישן ביותר' },
  { key: 'price-asc', label: 'מחיר: נמוך לגבוה' },
  { key: 'price-desc', label: 'מחיר: גבוה לנמוך' },
  { key: 'name', label: 'לפי שם' },
];

export default function PropertiesPage() {
  const { agent } = useAuth();
  const isAdmin = agent?.role === 'admin';
  const { properties, loading } = useProperties();

  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sold' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('date-new');

  // Unique cities from all properties (trimmed to handle DB trailing spaces)
  const cities = useMemo(() => {
    const set = new Set(properties.map(p => p.city?.trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'he'));
  }, [properties]);

  const filtered = useMemo(() => {
    let result = properties.filter(p => {
      if (filter === 'mine' && p.agent_id !== agent?.id) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (cityFilter && p.city?.trim() !== cityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const inTitle = p.title?.toLowerCase().includes(q);
        const inCity = p.city?.toLowerCase().includes(q);
        const inAddress = p.address?.toLowerCase().includes(q);
        const inDesc = (p as { description?: string }).description?.toLowerCase().includes(q);
        if (!inTitle && !inCity && !inAddress && !inDesc) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.current_price - b.current_price;
        case 'price-desc': return b.current_price - a.current_price;
        case 'name': return (a.title || '').localeCompare(b.title || '', 'he');
        case 'date-old': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date-new':
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [properties, filter, statusFilter, cityFilter, searchQuery, sortBy, agent?.id]);

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

  const hasActiveFilters = searchQuery.trim() || cityFilter || filter !== 'all' || statusFilter !== 'all' || sortBy !== 'date-new';

  function clearAllFilters() {
    setSearchQuery('');
    setCityFilter('');
    setFilter('all');
    setStatusFilter('all');
    setSortBy('date-new');
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, flexWrap: 'wrap', gap: 16,
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
            {filtered.length} נכסים
            {filter === 'mine' ? ' · אישיים' : ''}
            {statusFilter !== 'all' ? ` · ${statusLabel[statusFilter]}` : ''}
            {cityFilter ? ` · ${cityFilter}` : ''}
            {searchQuery.trim() ? ` · "${searchQuery.trim()}"` : ''}
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

      {/* Search + City + Sort row */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200, maxWidth: 400 }}>
          <div style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-muted)', pointerEvents: 'none', display: 'flex',
          }}>
            <IconSearch />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם, עיר, כתובת..."
            style={{
              width: '100%',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '8px 36px 8px 36px',
              color: 'var(--color-fg)',
              fontSize: 'var(--text-sm)',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
              direction: 'rtl',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(46,168,223,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--color-muted)', display: 'flex', padding: 2, borderRadius: 4,
              }}
            >
              <IconX />
            </button>
          )}
        </div>

        {/* City filter */}
        {cities.length > 1 && (
          <select
            value={cityFilter}
            onChange={e => setCityFilter(e.target.value)}
            style={{
              background: 'var(--color-surface)',
              border: `1px solid ${cityFilter ? 'rgba(46,168,223,0.5)' : 'var(--color-border)'}`,
              borderRadius: 8,
              padding: '8px 12px',
              color: cityFilter ? 'var(--color-fg)' : 'var(--color-muted)',
              fontSize: 'var(--text-sm)',
              outline: 'none',
              fontFamily: 'inherit',
              cursor: 'pointer',
              direction: 'rtl',
              minWidth: 130,
            }}
          >
            <option value="">כל האזורים</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        )}

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortKey)}
          style={{
            background: 'var(--color-surface)',
            border: `1px solid ${sortBy !== 'date-new' ? 'rgba(46,168,223,0.5)' : 'var(--color-border)'}`,
            borderRadius: 8,
            padding: '8px 12px',
            color: 'var(--color-fg)',
            fontSize: 'var(--text-sm)',
            outline: 'none',
            fontFamily: 'inherit',
            cursor: 'pointer',
            direction: 'rtl',
            minWidth: 160,
          }}
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '8px 12px',
              color: 'var(--color-muted)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-fg)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-fg)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
            }}
          >
            נקה הכל
          </button>
        )}
      </div>

      {/* Status + Owner Filters */}
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
            {properties.length === 0 ? 'אין נכסים עדיין' : 'לא נמצאו נכסים'}
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 28 }}>
            {properties.length === 0
              ? 'הוסף את הנכס הראשון שלך'
              : 'נסה לשנות את מסנני החיפוש'}
          </p>
          {properties.length === 0 ? (
            <Link href="/properties/new" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              הוסף נכס חדש
            </Link>
          ) : (
            <button
              onClick={clearAllFilters}
              className="btn-primary"
              style={{ fontFamily: 'inherit', fontSize: 'var(--text-sm)' }}
            >
              נקה מסננים
            </button>
          )}
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

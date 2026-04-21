'use client';

import { useEffect, useState, useMemo, use } from 'react';
import type { PropertyDetails, PropertyImage } from '@/types';

type OrgProperty = {
  id: string;
  title: string;
  address: string;
  city: string;
  current_price: number;
  status: string;
  created_at: string;
  property_details: PropertyDetails | null;
  property_images: PropertyImage[];
};

type Org = { id: string; name: string; contact_email?: string };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function imageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/property-images/${path}`;
}

function formatPrice(p: number) {
  return '₪' + p.toLocaleString('he-IL');
}

function coverImage(images: PropertyImage[]) {
  if (!images?.length) return null;
  return images.find(i => i.is_cover) || images.sort((a, b) => a.display_order - b.display_order)[0];
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
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function getPriceStep(max: number) {
  if (max <= 1_000_000) return 10_000;
  if (max <= 10_000_000) return 50_000;
  return 100_000;
}

function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number] | null;
  onChange: (v: [number, number] | null) => void;
}) {
  const step = getPriceStep(max);
  const current: [number, number] = value ?? [min, max];
  const [lo, hi] = current;
  const isActive = value !== null;

  const range = Math.max(1, max - min);
  const leftPct = ((lo - min) / range) * 100;
  const rightPct = ((hi - min) / range) * 100;

  function handleLo(e: React.ChangeEvent<HTMLInputElement>) {
    const next = Math.min(Number(e.target.value), hi);
    onChange([next, hi]);
  }
  function handleHi(e: React.ChangeEvent<HTMLInputElement>) {
    const next = Math.max(Number(e.target.value), lo);
    onChange([lo, next]);
  }

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: `1px solid ${isActive ? 'rgba(46,168,223,0.5)' : 'var(--color-border)'}`,
        borderRadius: 10,
        padding: '12px 16px 14px',
        direction: 'rtl',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10, gap: 12, flexWrap: 'wrap',
      }}>
        <span style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-muted)',
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}>
          טווח מחירים
        </span>
        <span style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-fg)',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 500,
        }}>
          {formatPrice(lo)} — {formatPrice(hi)}
        </span>
        {isActive && (
          <button
            onClick={() => onChange(null)}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              padding: '3px 10px',
              color: 'var(--color-muted)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            איפוס
          </button>
        )}
      </div>

      <div style={{ position: 'relative', height: 32, direction: 'ltr' }}>
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          height: 4, transform: 'translateY(-50%)',
          background: 'var(--color-surface-2, rgba(255,255,255,0.08))',
          borderRadius: 2,
        }} />
        <div style={{
          position: 'absolute', top: '50%',
          left: `${leftPct}%`, right: `${100 - rightPct}%`,
          height: 4, transform: 'translateY(-50%)',
          background: 'var(--color-accent)',
          borderRadius: 2,
        }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={handleLo}
          className="price-range-input"
          style={{ zIndex: lo > max - (max - min) * 0.05 ? 5 : 3 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={handleHi}
          className="price-range-input"
          style={{ zIndex: 4 }}
        />
      </div>

      <style jsx>{`
        .price-range-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 32px;
          appearance: none;
          -webkit-appearance: none;
          background: transparent;
          pointer-events: none;
          margin: 0;
          outline: none;
        }
        .price-range-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--color-accent);
          border: 2px solid var(--color-bg, #060f14);
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          transition: transform 0.1s;
        }
        .price-range-input::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .price-range-input::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--color-accent);
          border: 2px solid var(--color-bg, #060f14);
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
        }
        .price-range-input::-webkit-slider-runnable-track {
          background: transparent;
          border: none;
        }
        .price-range-input::-moz-range-track {
          background: transparent;
          border: none;
        }
      `}</style>
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildWhatsAppMessage(property: OrgProperty, orgId: string) {
  const price = formatPrice(property.current_price);
  const d = property.property_details;
  const specs = [
    d?.bedrooms ? `${d.bedrooms} חדרים` : null,
    d?.built_size_sqm ? `${d.built_size_sqm} מ"ר` : null,
  ].filter(Boolean).join(' · ');
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/org/${orgId}`;
  return [
    `🏠 *${property.title}*`,
    `📍 ${property.city}, ${property.address}`,
    `💰 ${price}`,
    specs ? `📐 ${specs}` : null,
    ``,
    `לפרטים נוספים: ${url}`,
  ].filter(s => s !== null).join('\n');
}

// ── Property Detail Modal ─────────────────────────────────────────────────────

function PropertyModal({
  property,
  orgId,
  onClose,
}: {
  property: OrgProperty;
  orgId: string;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [senderName, setSenderName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const images = [...(property.property_images || [])].sort(
    (a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0)
  );
  const d = property.property_details;

  async function sendInquiry() {
    if (!messageText.trim()) return;
    setSending(true);
    await fetch(`/api/org/${orgId}/inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        property_id: property.id,
        sender_name: senderName,
        message_text: messageText,
      }),
    });
    setSending(false);
    setSent(true);
    setMessageText('');
  }

  function onBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      onClick={onBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          width: '100%', maxWidth: 640,
          maxHeight: '90vh', overflowY: 'auto',
          direction: 'rtl',
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky', top: 0,
          background: 'var(--color-surface)', zIndex: 10,
        }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-fg)' }}>
            {property.title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--color-muted)', fontSize: 20, lineHeight: 1,
              padding: '2px 6px', borderRadius: 6,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          {/* Image Gallery */}
          {images.length > 0 ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                borderRadius: 12, overflow: 'hidden',
                aspectRatio: '16/9', background: 'var(--color-surface-2)',
                marginBottom: 8,
              }}>
                <img
                  src={imageUrl(images[activeImage].storage_path)}
                  alt={property.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(i)}
                      style={{
                        flexShrink: 0, width: 64, height: 44,
                        borderRadius: 8, overflow: 'hidden',
                        border: `2px solid ${activeImage === i ? 'var(--color-accent)' : 'transparent'}`,
                        cursor: 'pointer', padding: 0, background: 'none',
                        transition: 'border-color 0.15s',
                      }}
                    >
                      <img src={imageUrl(img.storage_path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              borderRadius: 12, aspectRatio: '16/9',
              background: 'var(--color-surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48, marginBottom: 16,
            }}>🏠</div>
          )}

          {/* Price & Location */}
          <div style={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 12, padding: '16px',
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-accent)', marginBottom: 6 }}>
              {formatPrice(property.current_price)}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-secondary)' }}>
              {property.city} · {property.address}
            </div>
          </div>

          {/* Specs */}
          {d && (
            <div style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 12, padding: '16px',
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-fg)', marginBottom: 12 }}>
                מפרט הנכס
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { label: 'חדרים', value: d.bedrooms ? String(d.bedrooms) : null },
                  { label: 'חדרי אמבטיה', value: d.bathrooms ? String(d.bathrooms) : null },
                  { label: 'שטח בנוי', value: d.built_size_sqm ? `${d.built_size_sqm} מ"ר` : null },
                  { label: 'שטח מגרש', value: d.lot_size_sqm ? `${d.lot_size_sqm} מ"ר` : null },
                ].filter(x => x.value).map(item => (
                  <div key={item.label} style={{
                    background: 'var(--color-surface-3)',
                    borderRadius: 8, padding: '8px 10px',
                  }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-fg)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              {(d.has_garden || d.has_balcony || d.has_pool) && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                  {d.has_garden && (
                    <span style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: 'var(--text-xs)', padding: '3px 10px', borderRadius: 20 }}>
                      גינה
                    </span>
                  )}
                  {d.has_balcony && (
                    <span style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)', fontSize: 'var(--text-xs)', padding: '3px 10px', borderRadius: 20 }}>
                      מרפסת
                    </span>
                  )}
                  {d.has_pool && (
                    <span style={{ background: 'rgba(34,211,238,0.08)', color: '#22d3ee', fontSize: 'var(--text-xs)', padding: '3px 10px', borderRadius: 20 }}>
                      בריכה
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Map */}
          <div style={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 12, overflow: 'hidden',
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-fg)', padding: '12px 16px 10px' }}>
              מיקום
            </div>
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(property.city + ' ' + property.address)}&output=embed&hl=iw&z=15`}
              width="100%"
              height="240"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`מפה: ${property.address}`}
            />
          </div>

          {/* WhatsApp Share */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(buildWhatsAppMessage(property, orgId))}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#25D366', color: '#fff',
              borderRadius: 10, padding: '11px 16px',
              fontSize: 'var(--text-sm)', fontWeight: 600,
              textDecoration: 'none', marginBottom: 12,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            שתף ב-WhatsApp
          </a>

          {/* Contact Form */}
          <div style={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 12, padding: '16px',
          }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-fg)', marginBottom: 14 }}>
              שלח הודעה לסוכן
            </div>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                <div style={{ color: 'var(--color-success)', fontWeight: 600, marginBottom: 4 }}>ההודעה נשלחה!</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>הסוכן יחזור אליך בהקדם</div>
                <button
                  onClick={() => setSent(false)}
                  style={{ color: 'var(--color-accent)', fontSize: 'var(--text-xs)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 10 }}
                >
                  שלח הודעה נוספת
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="text"
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  placeholder="השם שלך"
                  style={{
                    background: 'var(--color-surface-3)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8, padding: '10px 14px',
                    color: 'var(--color-fg)', fontSize: 'var(--text-sm)',
                    outline: 'none', fontFamily: 'inherit', width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
                <textarea
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  rows={3}
                  placeholder="כתוב הודעה לסוכן..."
                  style={{
                    background: 'var(--color-surface-3)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8, padding: '10px 14px',
                    color: 'var(--color-fg)', fontSize: 'var(--text-sm)',
                    outline: 'none', resize: 'none', fontFamily: 'inherit',
                    width: '100%', boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={sendInquiry}
                  disabled={sending || !messageText.trim()}
                  className="btn-primary"
                  style={{ fontSize: 'var(--text-sm)', padding: '10px', opacity: (!messageText.trim() || sending) ? 0.5 : 1 }}
                >
                  {sending ? 'שולח...' : 'שלח הודעה'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Catalog Page ─────────────────────────────────────────────────────────────

export default function OrgCatalogPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  const [org, setOrg] = useState<Org | null>(null);
  const [properties, setProperties] = useState<OrgProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<OrgProperty | null>(null);

  // Search / Filter / Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('date-new');
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);

  useEffect(() => {
    fetch(`/api/org/${orgId}/properties`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); }
        else { setOrg(data.org); setProperties(data.properties); }
        setLoading(false);
      })
      .catch(() => { setError('שגיאה בטעינת הנכסים'); setLoading(false); });
  }, [orgId]);

  // Unique cities (trimmed to handle DB trailing spaces)
  const cities = useMemo(() => {
    const set = new Set(properties.map(p => p.city?.trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'he'));
  }, [properties]);

  // Max price across all properties (dynamic ceiling for the slider)
  const maxPrice = useMemo(() => {
    if (properties.length === 0) return 0;
    const max = Math.max(...properties.map(p => p.current_price || 0));
    const step = getPriceStep(max);
    return Math.ceil(max / step) * step;
  }, [properties]);

  // Filtered + sorted properties
  const filtered = useMemo(() => {
    let result = properties.filter(p => {
      if (cityFilter && p.city?.trim() !== cityFilter) return false;
      if (priceRange) {
        const [minP, maxP] = priceRange;
        if (p.current_price < minP || p.current_price > maxP) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const inTitle = p.title?.toLowerCase().includes(q);
        const inCity = p.city?.toLowerCase().includes(q);
        const inAddress = p.address?.toLowerCase().includes(q);
        if (!inTitle && !inCity && !inAddress) return false;
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
  }, [properties, cityFilter, searchQuery, sortBy, priceRange]);

  const hasActiveFilters = searchQuery.trim() || cityFilter || sortBy !== 'date-new' || priceRange !== null;

  function clearFilters() {
    setSearchQuery('');
    setCityFilter('');
    setSortBy('date-new');
    setPriceRange(null);
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--color-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--color-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: 24,
      }} dir="rtl">
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏢</div>
          <h1 style={{ color: 'var(--color-fg)', fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 8 }}>
            משרד לא נמצא
          </h1>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
            {error || 'הקישור שגוי או שהמשרד אינו פעיל'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }} dir="rtl">
      {/* Header */}
      <header style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 32px',
        height: 56,
        display: 'flex', alignItems: 'center', gap: 16,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <span style={{
          fontSize: 'var(--text-sm)', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--color-fg)',
        }}>
          T<span style={{ color: 'var(--color-accent)' }}>·</span>ESTATE
        </span>
        <div style={{ width: 1, height: 16, background: 'var(--color-border)' }} />
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-secondary)', fontWeight: 400 }}>
          {org.name}
        </span>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            fontSize: 'var(--text-2xl)', fontWeight: 700,
            color: 'var(--color-fg)', letterSpacing: '-0.02em', marginBottom: 6,
          }}>
            נכסים זמינים
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', fontWeight: 300 }}>
            {filtered.length === properties.length
              ? `${properties.length} נכסים פעילים · ${org.name}`
              : `${filtered.length} מתוך ${properties.length} נכסים · ${org.name}`}
          </p>
        </div>

        {/* Search + Filter + Sort */}
        <div style={{
          display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200, maxWidth: 420 }}>
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
                borderRadius: 10,
                padding: '9px 36px 9px 36px',
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
                borderRadius: 10,
                padding: '9px 12px',
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
              borderRadius: 10,
              padding: '9px 12px',
              color: 'var(--color-fg)',
              fontSize: 'var(--text-sm)',
              outline: 'none',
              fontFamily: 'inherit',
              cursor: 'pointer',
              direction: 'rtl',
              minWidth: 165,
            }}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                padding: '9px 14px',
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
              נקה סינון
            </button>
          )}
        </div>

        {/* Price Range Slider */}
        {maxPrice > 0 && (
          <div style={{ marginBottom: 28 }}>
            <PriceRangeSlider
              min={0}
              max={maxPrice}
              value={priceRange}
              onChange={setPriceRange}
            />
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0',
            color: 'var(--color-muted)', fontSize: 'var(--text-sm)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
            {properties.length === 0
              ? 'אין נכסים פעילים כרגע'
              : 'לא נמצאו נכסים התואמים את החיפוש'}
            {hasActiveFilters && (
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={clearFilters}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    padding: '8px 16px',
                    color: 'var(--color-accent)',
                    fontSize: 'var(--text-sm)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  נקה סינון
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {filtered.map(p => {
              const cover = coverImage(p.property_images);
              const d = p.property_details;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProperty(p)}
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    textAlign: 'right',
                    padding: 0,
                    transition: 'border-color 0.2s, transform 0.15s',
                    display: 'flex', flexDirection: 'column',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  }}
                >
                  {/* Cover Image */}
                  <div style={{
                    width: '100%', aspectRatio: '16/10',
                    background: 'var(--color-surface-2)',
                    overflow: 'hidden', flexShrink: 0,
                    position: 'relative',
                  }}>
                    {cover ? (
                      <img
                        src={imageUrl(cover.storage_path)}
                        alt={p.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 36, color: 'var(--color-faint)',
                      }}>🏠</div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-fg)', lineHeight: 1.3 }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
                      {p.city} · {p.address}
                    </div>

                    {/* Specs row */}
                    {d && (d.bedrooms || d.bathrooms || d.built_size_sqm) && (
                      <div style={{ display: 'flex', gap: 12, fontSize: 'var(--text-xs)', color: 'var(--color-secondary)' }}>
                        {d.bedrooms && <span>{d.bedrooms} חד׳</span>}
                        {d.bathrooms && <span>{d.bathrooms} אמב׳</span>}
                        {d.built_size_sqm && <span>{d.built_size_sqm} מ&quot;ר</span>}
                      </div>
                    )}

                    <div style={{
                      marginTop: 'auto', paddingTop: 8,
                      borderTop: '1px solid var(--color-border-soft)',
                      fontSize: 'var(--text-lg)', fontWeight: 700,
                      color: 'var(--color-accent)',
                    }}>
                      {formatPrice(p.current_price)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <p style={{
          textAlign: 'center', fontSize: 'var(--text-xs)',
          color: 'var(--color-faint)', marginTop: 60,
        }}>
          מופעל על ידי T ESTATE · מערכת ניהול נכסי נדל״ן
        </p>
      </main>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          orgId={orgId}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  );
}

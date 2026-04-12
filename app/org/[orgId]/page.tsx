'use client';

import { useEffect, useState, use } from 'react';
import type { PropertyDetails, PropertyImage } from '@/types';

type OrgProperty = {
  id: string;
  title: string;
  address: string;
  city: string;
  current_price: number;
  status: string;
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

  // Close on backdrop click
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
        <div style={{ marginBottom: 36 }}>
          <h1 style={{
            fontSize: 'var(--text-2xl)', fontWeight: 700,
            color: 'var(--color-fg)', letterSpacing: '-0.02em', marginBottom: 6,
          }}>
            נכסים זמינים
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', fontWeight: 300 }}>
            {properties.length} נכסים פעילים · {org.name}
          </p>
        </div>

        {/* Grid */}
        {properties.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 0',
            color: 'var(--color-muted)', fontSize: 'var(--text-sm)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
            אין נכסים פעילים כרגע
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {properties.map(p => {
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

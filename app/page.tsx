'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MapBackground from '@/components/MapBackground';

// ── Public Catalog Types ──────────────────────────────────────────────────────
type PublicProperty = {
  id: string;
  title: string;
  address: string;
  city: string;
  current_price: number;
  organization_id: string;
  organizations: { id: string; name: string } | null;
  property_details: {
    bedrooms?: number; bathrooms?: number;
    built_size_sqm?: number; lot_size_sqm?: number;
    has_garden?: boolean; has_pool?: boolean; has_balcony?: boolean;
  } | null;
  property_images: { id: string; storage_path: string; is_cover: boolean; display_order: number }[];
};

const PUB_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
function pubImgUrl(path: string) {
  return `${PUB_SUPABASE_URL}/storage/v1/object/public/property-images/${path}`;
}
function pubFormatPrice(p: number) { return '₪' + p.toLocaleString('he-IL'); }
function pubCover(images: PublicProperty['property_images']) {
  if (!images?.length) return null;
  return images.find(i => i.is_cover) || [...images].sort((a, b) => a.display_order - b.display_order)[0];
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function IconBuilding() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h6M3 15h6M15 9h6M15 15h6"/>
    </svg>
  );
}
function IconMessage() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function IconLink() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'פרטי הכניסה שגויים — בדוק אימייל וסיסמה';
  if (msg.includes('Email not confirmed')) return 'האימייל טרם אומת — בדוק את תיבת הדואר שלך';
  if (msg.includes('User already registered')) return 'משתמש עם אימייל זה כבר קיים';
  if (msg.includes('Password should be at least')) return 'הסיסמה חייבת להכיל לפחות 6 תווים';
  if (msg.includes('Unable to validate email')) return 'כתובת האימייל אינה תקינה';
  if (msg.includes('signup_disabled') || msg.includes('Signup is disabled')) return 'ההרשמה מושבתת כרגע';
  return 'אירעה שגיאה — נסה שוב';
}

// ── Mock data for landing sections ────────────────────────────────────────────
const FEATURES = [
  {
    icon: <IconBuilding />,
    title: 'ניהול נכסים מרכזי',
    desc: 'כל הנכסים, התמונות, ההיסטוריית המחירים ומסמכי הנכס — מאורגנים ונגישים במקום אחד.',
    points: ['העלאת תמונות בקליק אחד', 'מעקב שינויי מחיר אוטומטי', 'ממשק ניהול אינטואיטיבי'],
  },
  {
    icon: <IconMessage />,
    title: 'ניהול לידים חכם',
    desc: 'פניות לקוחות מגיעות ישירות אליך, מקושרות לנכס הרלוונטי — ללא מייל, ללא בלבול.',
    points: ['פניות מקושרות לנכס', 'התראות בזמן אמת', 'היסטוריית שיחות מלאה'],
  },
  {
    icon: <IconLink />,
    title: 'חוויית לקוח פרימיום',
    desc: 'שלח ללקוחות קישור אישי ייחודי לצפייה בנכס — נקי, מקצועי, ובלי גישה למערכת.',
    points: ['דף נכס מעוצב ללקוח', 'קישורים עם תוקף ומעקב', 'ממשק לקוח פרטי ואישי'],
  },
];

const MOCK_PROPERTIES = [
  {
    title: 'פנטהאוז ים-תיכוני',
    city: 'תל אביב, הטיילת',
    price: '₪8,500,000',
    beds: 5, baths: 4, sqm: 280,
    tag: 'פעיל',
    color: '#1a4a60',
  },
  {
    title: 'וילה יוקרתית עם בריכה',
    city: 'הרצליה פיתוח',
    price: '₪12,200,000',
    beds: 6, baths: 5, sqm: 480,
    tag: 'פעיל',
    color: '#122e3d',
  },
  {
    title: 'דירת יוקרה במגדל',
    city: 'רמת גן, בורסה',
    price: '₪4,800,000',
    beds: 4, baths: 3, sqm: 175,
    tag: 'נמכר',
    color: '#0e2530',
  },
];

const TESTIMONIALS = [
  {
    quote: 'T ESTATE שינה לחלוטין את הדרך שאנחנו מנהלים את המשרד. כל הנכסים, כל הלקוחות — הכל בסדר ובשליטה מלאה.',
    name: 'יוסי כהן',
    role: 'מנהל משרד תיווך, תל אביב',
  },
  {
    quote: 'הלקוחות שלי מקבלים קישור אישי לנכס ונדהמים מהמקצועיות. זה בדיוק מה שחיפשתי.',
    name: 'רחל לוי',
    role: 'סוכנת נדל״ן, הרצליה',
  },
  {
    quote: 'מערכת שמרגישה כמו כלי עבודה אמיתי, לא כמו תבנית גנרית. ממליץ לכל משרד ברצינות.',
    name: 'דני אברהם',
    role: 'מנהל פרויקטים, גבעתיים',
  },
];

// ── Public Property Modal ─────────────────────────────────────────────────────
function PublicPropertyModal({ property, onClose }: { property: PublicProperty; onClose: () => void }) {
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
    await fetch(`/api/org/${property.organization_id}/inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: property.id, sender_name: senderName, message_text: messageText }),
    });
    setSending(false);
    setSent(true);
    setMessageText('');
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}
    >
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', direction: 'rtl' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 10 }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-fg)' }}>{property.title}</span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', fontSize: 20, lineHeight: 1, padding: '2px 6px', borderRadius: 6 }}>✕</button>
        </div>

        <div style={{ padding: 20 }}>
          {/* Images */}
          {images.length > 0 ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9', background: 'var(--color-surface-2)', marginBottom: 8 }}>
                <img src={pubImgUrl(images[activeImage].storage_path)} alt={property.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
                  {images.map((img, i) => (
                    <button key={img.id} onClick={() => setActiveImage(i)} style={{ flexShrink: 0, width: 64, height: 44, borderRadius: 8, overflow: 'hidden', border: `2px solid ${activeImage === i ? 'var(--color-accent)' : 'transparent'}`, cursor: 'pointer', padding: 0, background: 'none', transition: 'border-color 0.15s' }}>
                      <img src={pubImgUrl(img.storage_path)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ borderRadius: 12, aspectRatio: '16/9', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, marginBottom: 16 }}>🏠</div>
          )}

          {/* Price & Location */}
          <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-accent)', marginBottom: 6 }}>{pubFormatPrice(property.current_price)}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-secondary)' }}>{property.city} · {property.address}</div>
            {property.organizations?.name && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: 4 }}>{property.organizations.name}</div>
            )}
          </div>

          {/* Specs */}
          {d && (
            <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-fg)', marginBottom: 12 }}>מפרט הנכס</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { label: 'חדרים', value: d.bedrooms ? String(d.bedrooms) : null },
                  { label: 'אמבטיה', value: d.bathrooms ? String(d.bathrooms) : null },
                  { label: 'שטח בנוי', value: d.built_size_sqm ? `${d.built_size_sqm} מ"ר` : null },
                  { label: 'שטח מגרש', value: d.lot_size_sqm ? `${d.lot_size_sqm} מ"ר` : null },
                ].filter(x => x.value).map(item => (
                  <div key={item.label} style={{ background: 'var(--color-surface-3)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-fg)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
              {(d.has_garden || d.has_balcony || d.has_pool) && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                  {d.has_garden && <span style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: 'var(--text-xs)', padding: '3px 10px', borderRadius: 20 }}>גינה</span>}
                  {d.has_balcony && <span style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)', fontSize: 'var(--text-xs)', padding: '3px 10px', borderRadius: 20 }}>מרפסת</span>}
                  {d.has_pool && <span style={{ background: 'rgba(34,211,238,0.08)', color: '#22d3ee', fontSize: 'var(--text-xs)', padding: '3px 10px', borderRadius: 20 }}>בריכה</span>}
                </div>
              )}
            </div>
          )}

          {/* Inquiry Form */}
          <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-fg)', marginBottom: 14 }}>שלח הודעה לסוכן</div>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                <div style={{ color: 'var(--color-success)', fontWeight: 600, marginBottom: 4 }}>ההודעה נשלחה!</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>הסוכן יחזור אליך בהקדם</div>
                <button onClick={() => setSent(false)} style={{ color: 'var(--color-accent)', fontSize: 'var(--text-xs)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 10, fontFamily: 'inherit' }}>שלח הודעה נוספת</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="השם שלך"
                  style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 14px', color: 'var(--color-fg)', fontSize: 'var(--text-sm)', outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
                <textarea value={messageText} onChange={e => setMessageText(e.target.value)} rows={3} placeholder="כתוב הודעה לסוכן..."
                  style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 14px', color: 'var(--color-fg)', fontSize: 'var(--text-sm)', outline: 'none', resize: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
                <button onClick={sendInquiry} disabled={sending || !messageText.trim()} className="btn-primary" style={{ fontSize: 'var(--text-sm)', padding: '10px', opacity: (!messageText.trim() || sending) ? 0.5 : 1 }}>
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

// ── Input style helper ────────────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: 'rgba(6, 15, 20, 0.7)',
  border: '1px solid rgba(46, 168, 223, 0.15)',
  borderRadius: '8px',
  color: 'var(--color-fg)',
  fontSize: 'var(--text-base)',
  lineHeight: 'var(--leading-normal)',
  outline: 'none',
  transition: 'border-color 0.18s ease',
  fontFamily: 'inherit',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Public catalog state
  const [pubProps, setPubProps] = useState<PublicProperty[]>([]);
  const [pubLoading, setPubLoading] = useState(true);
  const [pubSelected, setPubSelected] = useState<PublicProperty | null>(null);
  const [pubSearch, setPubSearch] = useState('');
  const [pubCity, setPubCity] = useState('');
  const [pubSort, setPubSort] = useState<'newest' | 'price_asc' | 'price_desc' | 'rooms_desc'>('newest');
  const [pubShowAll, setPubShowAll] = useState(false);

  const { signIn, signUp, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.push('/dashboard');
  }, [isAuthenticated, router]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    fetch('/api/properties/public', { signal: controller.signal })
      .then(r => r.json())
      .then(d => { if (!d.error) setPubProps(d.properties || []); })
      .catch(() => { /* silently fall back to mock properties */ })
      .finally(() => { setPubLoading(false); clearTimeout(timer); });
    return () => { controller.abort(); clearTimeout(timer); };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        const { needsEmailConfirmation } = await signUp(email, password, orgName, fullName);
        if (needsEmailConfirmation) {
          setSuccessMsg('החשבון נוצר בהצלחה! שלחנו אימייל אישור — לחץ על הקישור ואז חזור להתחבר.');
          setMode('login');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? translateError(err.message) : 'אירעה שגיאה');
    } finally {
      setLoading(false);
    }
  }

  function scrollToAuth() {
    document.getElementById('auth-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Unique cities for filter dropdown (trim whitespace to handle dirty DB data)
  const pubCities = Array.from(new Set(pubProps.map(p => p.city?.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'he'));

  const pubFiltered = pubProps
    .filter(p => {
      const q = pubSearch.trim();
      if (q) {
        const ql = q.toLowerCase();
        const matchesText =
          p.title.toLowerCase().includes(ql) ||
          p.title.includes(q) ||
          (p.city?.trim()).toLowerCase().includes(ql) ||
          (p.city?.trim()).includes(q) ||
          p.address.toLowerCase().includes(ql) ||
          p.address.includes(q);
        if (!matchesText) return false;
      }
      if (pubCity && p.city?.trim() !== pubCity) return false;
      return true;
    })
    .sort((a, b) => {
      if (pubSort === 'price_asc') return a.current_price - b.current_price;
      if (pubSort === 'price_desc') return b.current_price - a.current_price;
      if (pubSort === 'rooms_desc') return (b.property_details?.bedrooms ?? 0) - (a.property_details?.bedrooms ?? 0);
      return 0; // 'newest' — API already orders by created_at desc
    });

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-fg)', minHeight: '100vh' }}>

      {/* ── TOP NAV ─────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, right: 0, left: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '60px',
        background: 'rgba(6, 15, 20, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(46,168,223,0.07)',
      }}>
        {/* Logo */}
        <span style={{
          fontSize: '1.0625rem',
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--color-fg)',
          userSelect: 'none',
        }}>
          T<span style={{ color: 'var(--color-accent)' }}>·</span>ESTATE
        </span>

        {/* Nav links - desktop */}
        <div className="hidden md:flex" style={{ gap: 32, alignItems: 'center' }}>
          {[['#features', 'יתרונות'], ['#showcase', 'נכסים'], ['#testimonials', 'לקוחות']].map(([href, label]) => (
            <a key={href} href={href} style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--color-secondary)',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--color-fg)'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--color-secondary)'}
            >{label}</a>
          ))}
          <button
            onClick={scrollToAuth}
            style={{
              padding: '7px 20px',
              background: 'transparent',
              border: '1px solid rgba(46,168,223,0.3)',
              borderRadius: '7px',
              color: 'var(--color-accent)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(46,168,223,0.07)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(46,168,223,0.3)';
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            כניסה
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <MapBackground />

        <div style={{
          position: 'relative', zIndex: 10,
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '80px 40px 60px',
          display: 'flex',
          alignItems: 'center',
          gap: 64,
          flexWrap: 'wrap',
        }}>

          {/* ── Marketing copy (RTL: right side, first child) ── */}
          <div style={{ flex: '1 1 420px', minWidth: 0 }} className="animate-fade-up">
            <span className="section-label" style={{ display: 'block', marginBottom: 24 }}>
              פלטפורמת הנדל״ן המתקדמת בישראל
            </span>

            <h1 style={{
              fontSize: 'var(--text-hero)',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.025em',
              color: 'var(--color-fg)',
              marginBottom: 24,
              maxWidth: '560px',
            }}>
              הדרך החכמה<br />
              <span style={{ color: 'var(--color-accent)' }}>לשווק נדל״ן.</span>
            </h1>

            <p style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 300,
              lineHeight: 1.7,
              color: 'var(--color-secondary)',
              maxWidth: '480px',
              marginBottom: 40,
            }}>
              מערכת פרימיום למשרדי נדל״ן וסוכנים — להצגת נכסים, ניהול לידים וחוויית לקוח ברמה הגבוהה ביותר.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={scrollToAuth} style={{ fontSize: '1rem' }}>
                התחילו עכשיו
                <IconArrow />
              </button>
              <a
                href="#features"
                className="btn-ghost"
                style={{ textDecoration: 'none', fontSize: '1rem' }}
              >
                גלו עוד
              </a>
            </div>

            {/* Social proof strip */}
            <div style={{
              marginTop: 48,
              display: 'flex',
              gap: 32,
              alignItems: 'center',
              borderTop: '1px solid var(--color-border-soft)',
              paddingTop: 32,
            }}>
              {[['200+', 'משרדי תיווך'], ['4,800+', 'נכסים פעילים'], ['98%', 'שביעות רצון']].map(([num, label]) => (
                <div key={label}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-fg)', lineHeight: 1 }}>{num}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-secondary)', marginTop: 4, fontWeight: 400 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Auth card (RTL: left side, second child) ── */}
          <div
            id="auth-card"
            className="card-glass animate-fade-up-delay-2"
            style={{ flex: '0 0 380px', width: '100%', maxWidth: '420px', padding: '36px 32px' }}
          >
            {/* Card header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                {(['login', 'signup'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(''); setSuccessMsg(''); }}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      background: mode === m ? 'var(--color-accent-bg)' : 'transparent',
                      border: `1px solid ${mode === m ? 'rgba(46,168,223,0.25)' : 'transparent'}`,
                      borderRadius: '7px',
                      color: mode === m ? 'var(--color-accent)' : 'var(--color-muted)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: mode === m ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      fontFamily: 'inherit',
                    }}
                  >
                    {m === 'login' ? 'כניסה' : 'הרשמה'}
                  </button>
                ))}
              </div>

              <h2 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 700,
                color: 'var(--color-fg)',
                marginBottom: 6,
              }}>
                {mode === 'login' ? 'ברוכים השבים' : 'צרו חשבון חינם'}
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-secondary)', fontWeight: 300 }}>
                {mode === 'login'
                  ? 'הכנס את פרטי החשבון שלך להמשך'
                  : 'כמה שניות ואתם בפנים'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {mode === 'signup' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-secondary)', marginBottom: 6 }}>
                      שם מלא
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      required
                      placeholder="ישראל ישראלי"
                      autoComplete="name"
                      style={inputBase}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(46,168,223,0.45)'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(46,168,223,0.15)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-secondary)', marginBottom: 6 }}>
                      שם המשרד / חברה
                    </label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                      required
                      placeholder="משרד תיווך הדר"
                      autoComplete="organization"
                      style={inputBase}
                      onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(46,168,223,0.45)'}
                      onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(46,168,223,0.15)'}
                    />
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-secondary)', marginBottom: 6 }}>
                  אימייל
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="agent@example.com"
                  dir="ltr"
                  autoComplete="email"
                  style={inputBase}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(46,168,223,0.45)'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(46,168,223,0.15)'}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-secondary)' }}>
                    סיסמה
                  </label>
                  {mode === 'login' && (
                    <button type="button" style={{
                      fontSize: 'var(--text-xs)', color: 'var(--color-muted)', background: 'none',
                      border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit',
                      transition: 'color 0.15s',
                    }}
                      onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--color-accent)'}
                      onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--color-muted)'}
                    >
                      שכחתי סיסמה
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="לפחות 6 תווים"
                  dir="ltr"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={6}
                  style={inputBase}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(46,168,223,0.45)'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(46,168,223,0.15)'}
                />
              </div>

              {successMsg && (
                <div style={{
                  padding: '10px 14px',
                  background: 'var(--color-success-bg)',
                  border: '1px solid rgba(61,214,140,0.2)',
                  borderRadius: '8px',
                  color: 'var(--color-success)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 1.5,
                }}>
                  {successMsg}
                </div>
              )}

              {error && (
                <div style={{
                  padding: '10px 14px',
                  background: 'var(--color-danger-bg)',
                  border: '1px solid rgba(240,104,120,0.2)',
                  borderRadius: '8px',
                  color: 'var(--color-danger)',
                  fontSize: 'var(--text-sm)',
                  lineHeight: 1.5,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', marginTop: 4 }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}/>
                    טוען...
                  </span>
                ) : mode === 'login' ? 'כניסה למערכת' : 'יצירת חשבון'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom fade to next section */}
        <div style={{
          position: 'absolute', bottom: 0, right: 0, left: 0, height: 120,
          background: 'linear-gradient(to bottom, transparent, var(--color-bg))',
          pointerEvents: 'none', zIndex: 5,
        }}/>
      </section>

      {/* ── FEATURES SECTION ─────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 40px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="section-label" style={{ display: 'block', marginBottom: 16 }}>
            למה T ESTATE
          </span>
          <h2 style={{
            fontSize: 'var(--text-display)',
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--color-fg)',
          }}>
            הכלים שסוכנים מקצועיים צריכים
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="card-surface"
              style={{
                padding: '36px 32px',
                transition: 'border-color 0.2s, transform 0.2s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(46,168,223,0.25)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: 48, height: 48,
                background: 'var(--color-accent-bg)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-accent)',
                marginBottom: 24,
              }}>
                {f.icon}
              </div>

              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-fg)', marginBottom: 12 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-secondary)', lineHeight: 1.65, marginBottom: 20 }}>
                {f.desc}
              </p>

              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {f.points.map(pt => (
                  <li key={pt} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--color-accent-bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--color-accent)', flexShrink: 0,
                    }}>
                      <IconCheck />
                    </span>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-secondary)', fontWeight: 400 }}>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROPERTIES SHOWCASE ──────────────────────────────────────── */}
      <section id="showcase" style={{
        padding: '100px 40px',
        background: `linear-gradient(180deg, var(--color-bg) 0%, var(--color-surface) 50%, var(--color-bg) 100%)`,
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: pubProps.length > 0 ? 20 : 56 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: pubProps.length > 0 ? 20 : 0 }}>
              <div>
                <span className="section-label" style={{ display: 'block', marginBottom: 12 }}>
                  {pubProps.length > 0 ? 'נכסים זמינים' : 'דוגמאות לנכסים'}
                </span>
                <h2 style={{ fontSize: 'var(--text-display)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--color-fg)' }}>
                  {pubProps.length > 0 ? 'נכסים פעילים בשוק' : 'נכסים שמשיגים תוצאות'}
                </h2>
              </div>
              {pubProps.length === 0 && (
                <button className="btn-ghost" onClick={scrollToAuth} style={{ whiteSpace: 'nowrap' }}>הוסף נכס</button>
              )}
            </div>

            {/* Search + Filter + Sort controls */}
            {pubProps.length > 0 && (
              <div style={{
                display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
                padding: '14px 16px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
              }}>
                {/* Search input */}
                <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
                  <svg
                    width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)', pointerEvents: 'none' }}
                  >
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    value={pubSearch}
                    onChange={e => { setPubSearch(e.target.value); setPubShowAll(false); }}
                    placeholder="חיפוש חופשי — עיר, כותרת, כתובת..."
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8, padding: '9px 36px 9px 12px',
                      color: 'var(--color-fg)', fontSize: 'var(--text-sm)',
                      outline: 'none', fontFamily: 'inherit', direction: 'rtl',
                    }}
                  />
                  {pubSearch && (
                    <button
                      onClick={() => { setPubSearch(''); setPubShowAll(false); }}
                      style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: '2px 4px', lineHeight: 1, fontSize: 14 }}
                      aria-label="נקה חיפוש"
                    >✕</button>
                  )}
                </div>

                {/* City / Area filter */}
                {pubCities.length > 1 && (
                  <select
                    value={pubCity}
                    onChange={e => { setPubCity(e.target.value); setPubShowAll(false); }}
                    style={{
                      flex: '0 1 160px',
                      background: 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8, padding: '9px 12px',
                      color: pubCity ? 'var(--color-fg)' : 'var(--color-muted)',
                      fontSize: 'var(--text-sm)',
                      outline: 'none', fontFamily: 'inherit', direction: 'rtl',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">כל האזורים</option>
                    {pubCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                )}

                {/* Sort */}
                <select
                  value={pubSort}
                  onChange={e => { setPubSort(e.target.value as typeof pubSort); setPubShowAll(false); }}
                  style={{
                    flex: '0 1 160px',
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8, padding: '9px 12px',
                    color: 'var(--color-fg)',
                    fontSize: 'var(--text-sm)',
                    outline: 'none', fontFamily: 'inherit', direction: 'rtl',
                    cursor: 'pointer',
                  }}
                >
                  <option value="newest">חדשים ביותר</option>
                  <option value="price_asc">מחיר: נמוך לגבוה</option>
                  <option value="price_desc">מחיר: גבוה לנמוך</option>
                  <option value="rooms_desc">חדרים: הרבה לפחות</option>
                </select>

                {/* Clear all filters */}
                {(pubSearch || pubCity || pubSort !== 'newest') && (
                  <button
                    onClick={() => { setPubSearch(''); setPubCity(''); setPubSort('newest'); setPubShowAll(false); }}
                    style={{
                      flex: '0 0 auto',
                      background: 'none', border: '1px solid var(--color-border)',
                      borderRadius: 8, padding: '9px 14px',
                      color: 'var(--color-muted)', fontSize: 'var(--text-sm)',
                      cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                      transition: 'color 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-fg)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-fg)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-muted)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'; }}
                  >
                    נקה הכל
                  </button>
                )}
              </div>
            )}
          </div>

          {pubLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div className="spinner" />
            </div>
          ) : pubProps.length > 0 ? (
            <>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 24 }}>
                {pubFiltered.length} נכסים
                {pubSearch && ` · חיפוש: "${pubSearch}"`}
                {pubCity && ` · אזור: ${pubCity}`}
                {pubSort !== 'newest' && ` · ממוין לפי: ${{ price_asc: 'מחיר עולה', price_desc: 'מחיר יורד', rooms_desc: 'חדרים' }[pubSort]}`}
              </p>

              {pubFiltered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-muted)' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                  <p>לא נמצאו נכסים התואמים לחיפוש</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                  {(pubShowAll ? pubFiltered : pubFiltered.slice(0, 6)).map(p => {
                    const cover = pubCover(p.property_images);
                    const d = p.property_details;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setPubSelected(p)}
                        style={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 14, overflow: 'hidden',
                          cursor: 'pointer', textAlign: 'right',
                          padding: 0, transition: 'border-color 0.2s, transform 0.15s',
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
                        {/* Cover image */}
                        <div style={{ width: '100%', aspectRatio: '16/10', background: 'var(--color-surface-2)', overflow: 'hidden', flexShrink: 0 }}>
                          {cover ? (
                            <img src={pubImgUrl(cover.storage_path)} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🏠</div>
                          )}
                        </div>
                        {/* Card body */}
                        <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-fg)', lineHeight: 1.3 }}>{p.title}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>{p.city} · {p.address}</div>
                          {d && (d.bedrooms || d.bathrooms || d.built_size_sqm) && (
                            <div style={{ display: 'flex', gap: 12, fontSize: 'var(--text-xs)', color: 'var(--color-secondary)' }}>
                              {d.bedrooms && <span>{d.bedrooms} חד׳</span>}
                              {d.bathrooms && <span>{d.bathrooms} אמב׳</span>}
                              {d.built_size_sqm && <span>{d.built_size_sqm} מ&quot;ר</span>}
                            </div>
                          )}
                          <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--color-border-soft)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-accent)' }}>
                            {pubFormatPrice(p.current_price)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {!pubShowAll && pubFiltered.length > 6 && (
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                  <button className="btn-ghost" onClick={() => setPubShowAll(true)}>
                    הצג עוד {pubFiltered.length - 6} נכסים
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Fallback: mock properties when no real data in system */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {MOCK_PROPERTIES.map((p, i) => (
                <div key={i}
                  style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)', transition: 'border-color 0.2s, transform 0.2s', cursor: 'default', background: 'var(--color-surface)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(46,168,223,0.3)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                >
                  <div style={{ height: 200, background: `linear-gradient(135deg, ${p.color} 0%, #060f14 100%)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(46,168,223,0.25)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <div style={{ position: 'absolute', top: 14, right: 14 }}>
                      <span className={p.tag === 'פעיל' ? 'status-active' : 'status-sold'}>{p.tag}</span>
                    </div>
                  </div>
                  <div style={{ padding: '20px 20px 22px' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-fg)', marginBottom: 4 }}>{p.title}</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 16 }}>{p.city}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-accent)', letterSpacing: '-0.01em' }}>{p.price}</span>
                      <div style={{ display: 'flex', gap: 14 }}>
                        {[`${p.beds} חד׳`, `${p.sqm} מ״ר`].map(val => (
                          <span key={val} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', fontWeight: 500 }}>{val}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section id="testimonials" style={{ padding: '100px 40px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="section-label" style={{ display: 'block', marginBottom: 16 }}>לקוחות מדברים</span>
          <h2 style={{
            fontSize: 'var(--text-display)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            color: 'var(--color-fg)',
          }}>
            מה הלקוחות שלנו אומרים
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="card-surface"
              style={{ padding: '32px 28px' }}
            >
              {/* Quote mark */}
              <div style={{
                fontSize: 40,
                lineHeight: 1,
                color: 'var(--color-accent)',
                opacity: 0.4,
                fontWeight: 700,
                marginBottom: 16,
                fontFamily: 'Georgia, serif',
              }}>
                ״
              </div>
              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-secondary)',
                lineHeight: 1.7,
                fontWeight: 300,
                marginBottom: 24,
              }}>
                {t.quote}
              </p>
              <div style={{ borderTop: '1px solid var(--color-border-soft)', paddingTop: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-fg)' }}>{t.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: 3 }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ───────────────────────────────────────────────── */}
      <section id="contact" style={{ padding: '80px 40px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <span className="section-label" style={{ display: 'block', marginBottom: 20 }}>
            מוכנים להתחיל?
          </span>
          <h2 style={{
            fontSize: 'var(--text-display)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            lineHeight: 1.12,
            color: 'var(--color-fg)',
            marginBottom: 20,
          }}>
            הצטרפו למשרדים המובילים
          </h2>
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-secondary)',
            fontWeight: 300,
            lineHeight: 1.65,
            marginBottom: 40,
          }}>
            ללא עלות בהתחלה. ללא כרטיס אשראי. ללא מחויבות.<br />
            פשוט תנסו ותראו את ההבדל.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={scrollToAuth} style={{ fontSize: '1.0625rem', padding: '14px 36px' }}>
              התחילו עכשיו — חינם
              <IconArrow />
            </button>
          </div>
        </div>

        {/* Footer bottom */}
        <div style={{
          marginTop: 80,
          paddingTop: 32,
          borderTop: '1px solid var(--color-border-soft)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          maxWidth: 1280,
          margin: '80px auto 0',
        }}>
          <span style={{
            fontSize: '0.9375rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-fg)',
          }}>
            T<span style={{ color: 'var(--color-accent)' }}>·</span>ESTATE
          </span>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
            © 2026 T Estate. כל הזכויות שמורות.
          </p>
        </div>
      </section>

      {/* Property detail modal */}
      {pubSelected && (
        <PublicPropertyModal
          property={pubSelected}
          onClose={() => setPubSelected(null)}
        />
      )}

    </div>
  );
}

'use client';

import { useEffect, useState, use } from 'react';
import type { PropertyDetails, PropertyImage } from '@/types';

type ClientProperty = {
  id: string;
  title: string;
  address: string;
  city: string;
  description?: string;
  current_price: number;
  status: string;
  property_details: PropertyDetails | null;
  property_images: PropertyImage[];
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function ClientPropertyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [property, setProperty] = useState<ClientProperty | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Messaging
  const [senderName, setSenderName] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`/api/client/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); }
        else { setProperty(data.property); }
        setLoading(false);
      })
      .catch(() => { setError('שגיאה בטעינת הנכס'); setLoading(false); });
  }, [token]);

  function formatPrice(p: number) {
    return '₪' + p.toLocaleString('he-IL');
  }

  async function sendMessage() {
    if (!messageText.trim()) return;
    setSending(true);
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, sender_name: senderName, message_text: messageText }),
    });
    setSending(false);
    setSent(true);
    setMessageText('');
  }

  function imageUrl(path: string) {
    return `${SUPABASE_URL}/storage/v1/object/public/property-images/${path}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center px-6">
        <div>
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-white text-xl font-semibold mb-2">קישור לא זמין</h1>
          <p className="text-gray-400">{error || 'הקישור שגוי או פג תוקפו'}</p>
        </div>
      </div>
    );
  }

  const images = [...(property.property_images || [])].sort((a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0));
  const d = property.property_details;

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm">🏠</div>
        <span className="font-semibold text-white">T ESTATE</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Image Gallery */}
        {images.length > 0 ? (
          <div className="mb-6">
            <div className="rounded-2xl overflow-hidden aspect-video bg-gray-800 mb-3">
              <img
                src={imageUrl(images[activeImage].storage_path)}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img src={imageUrl(img.storage_path)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-gray-900 aspect-video flex items-center justify-center text-6xl mb-6">🏠</div>
        )}

        {/* Title & Price */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{property.title}</h1>
              <p className="text-gray-400">{property.city} · {property.address}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full flex-shrink-0 ${
              property.status === 'active' ? 'bg-green-900/40 text-green-400' :
              property.status === 'sold' ? 'bg-blue-900/40 text-blue-400' : 'bg-gray-800 text-gray-500'
            }`}>
              {property.status === 'active' ? 'פעיל' : property.status === 'sold' ? 'נמכר' : 'לא פעיל'}
            </span>
          </div>
          <div className="text-3xl font-bold text-blue-400">{formatPrice(property.current_price)}</div>
        </div>

        {/* Specs */}
        {d && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
            <h2 className="font-semibold text-white mb-4">מפרט הנכס</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'שטח מגרש', value: d.lot_size_sqm ? `${d.lot_size_sqm} מ"ר` : null },
                { label: 'שטח בנוי', value: d.built_size_sqm ? `${d.built_size_sqm} מ"ר` : null },
                { label: 'חדרים', value: d.bedrooms ? String(d.bedrooms) : null },
                { label: 'חדרי אמבטיה', value: d.bathrooms ? String(d.bathrooms) : null },
                { label: 'גיל הנכס', value: d.house_age_years ? `${d.house_age_years} שנים` : null },
                { label: 'חניות', value: d.parking_spaces ? String(d.parking_spaces) : null },
              ].filter(x => x.value).map(item => (
                <div key={item.label} className="bg-gray-800 rounded-xl p-3">
                  <div className="text-gray-500 text-xs mb-1">{item.label}</div>
                  <div className="text-white font-medium">{item.value}</div>
                </div>
              ))}
            </div>
            {(d.has_garden || d.has_balcony || d.has_pool) && (
              <div className="flex gap-2 flex-wrap mt-4">
                {d.has_garden && <span className="bg-green-900/30 text-green-400 text-xs px-3 py-1 rounded-full">🌿 גינה</span>}
                {d.has_balcony && <span className="bg-blue-900/30 text-blue-400 text-xs px-3 py-1 rounded-full">🏗 מרפסת</span>}
                {d.has_pool && <span className="bg-cyan-900/30 text-cyan-400 text-xs px-3 py-1 rounded-full">🏊 בריכה</span>}
              </div>
            )}
            {d.additional_features && (
              <p className="text-gray-400 text-sm mt-4 border-t border-gray-800 pt-4">{d.additional_features}</p>
            )}
          </div>
        )}

        {/* Description */}
        {property.description && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
            <h2 className="font-semibold text-white mb-3">תיאור</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{property.description}</p>
          </div>
        )}

        {/* Contact Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
          <h2 className="font-semibold text-white mb-4">שלח הודעה לסוכן</h2>
          {sent ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">✓</div>
              <p className="text-green-400 font-medium">ההודעה נשלחה!</p>
              <p className="text-gray-500 text-sm mt-1">הסוכן יחזור אליך בהקדם</p>
              <button onClick={() => setSent(false)} className="text-blue-400 text-sm mt-3 hover:underline">שלח הודעה נוספת</button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                placeholder="השם שלך"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
              />
              <textarea
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                rows={3}
                placeholder="כתוב הודעה לסוכן..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm resize-none"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !messageText.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                {sending ? 'שולח...' : 'שלח הודעה'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8">מופעל על ידי T ESTATE · מערכת ניהול נכסי נדל״ן</p>
      </div>
    </div>
  );
}

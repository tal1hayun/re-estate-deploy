'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { supabase } from '@/lib/supabase';
import type { Property, PropertyDetails, PropertyImage, PriceHistory, Agent, SharedLink, Message } from '@/types';

type FullProperty = Property & {
  agents: Agent;
  property_details: PropertyDetails | null;
  property_images: PropertyImage[];
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function PropertyPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = use(params);
  const { agent } = useAuth();
  const router = useRouter();
  const { updatePrice, uploadImage, deleteImage } = useProperties();

  const [property, setProperty] = useState<FullProperty | null>(null);
  const [priceHistory, setPriceHistory] = useState<(PriceHistory & { agents: { full_name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'images' | 'price' | 'share' | 'messages'>('overview');

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Shared links state
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [newLinkName, setNewLinkName] = useState('');
  const [creatingLink, setCreatingLink] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit state
  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [priceReason, setPriceReason] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  // Image upload
  const [uploading, setUploading] = useState(false);

  const isOwn = property?.agent_id === agent?.id;

  useEffect(() => {
    fetchProperty();
    fetchPriceHistory();
    fetchSharedLinks();
    fetchMessages();

    // Realtime subscription for new messages
    const channel = supabase
      .channel(`messages:${propertyId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `property_id=eq.${propertyId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message]);
        if ((payload.new as Message).sender_type === 'client') {
          setUnreadCount(c => c + 1);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [propertyId]);

  async function fetchMessages() {
    const res = await fetch(`/api/messages/reply?property_id=${propertyId}`);
    const json = await res.json();
    const msgs = json.messages || [];
    setMessages(msgs);
    setUnreadCount(msgs.filter((m: Message) => m.sender_type === 'client' && !m.is_read).length);
  }

  async function sendReply() {
    if (!replyText.trim() || !agent) return;
    setSendingReply(true);
    const text = replyText.trim();
    setReplyText('');
    await fetch('/api/messages/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: propertyId, message_text: text }),
    });
    await fetchMessages();
    setSendingReply(false);
  }

  async function markAllRead() {
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('property_id', propertyId)
      .eq('sender_type', 'client')
      .eq('is_read', false);
    setUnreadCount(0);
    setMessages(prev => prev.map(m => m.sender_type === 'client' ? { ...m, is_read: true } : m));
  }

  async function fetchSharedLinks() {
    const { data } = await supabase
      .from('shared_links')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });
    setSharedLinks(data || []);
  }

  async function createSharedLink() {
    setCreatingLink(true);
    const token = crypto.randomUUID().replace(/-/g, '');
    const { data: { user } } = await supabase.auth.getUser();
    const { data: ag } = await supabase.from('agents').select('id').eq('user_id', user!.id).single();
    await supabase.from('shared_links').insert({
      property_id: propertyId,
      agent_id: ag?.id,
      created_by: ag?.id,
      token,
      client_name: newLinkName || null,
      is_active: true,
    });
    setNewLinkName('');
    setCreatingLink(false);
    fetchSharedLinks();
  }

  async function revokeLink(linkId: string) {
    await supabase.from('shared_links').update({ is_active: false }).eq('id', linkId);
    fetchSharedLinks();
  }

  function copyLink(token: string, id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/client/${token}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function fetchProperty() {
    const { data } = await supabase
      .from('properties')
      .select(`
        *,
        agents(id, full_name, email, avatar_url),
        property_details(*),
        property_images(id, storage_path, is_cover, display_order)
      `)
      .eq('id', propertyId)
      .single();
    setProperty(data);
    setLoading(false);
  }

  async function fetchPriceHistory() {
    const { data } = await supabase
      .from('price_history')
      .select('*, agents(full_name)')
      .eq('property_id', propertyId)
      .order('changed_at', { ascending: false });
    setPriceHistory(data || []);
  }

  async function handlePriceUpdate() {
    if (!newPrice) return;
    setSavingPrice(true);
    await updatePrice(propertyId, Number(newPrice), priceReason || undefined);
    setEditingPrice(false);
    setNewPrice('');
    setPriceReason('');
    setSavingPrice(false);
    fetchProperty();
    fetchPriceHistory();
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const isFirst = property?.property_images.length === 0;
    for (let i = 0; i < files.length; i++) {
      await uploadImage(propertyId, files[i], isFirst && i === 0);
    }
    setUploading(false);
    fetchProperty();
    e.target.value = '';
  }

  async function handleDeleteImage(imageId: string, storagePath: string) {
    await deleteImage(propertyId, imageId, storagePath);
    fetchProperty();
  }

  async function handleSetCover(imageId: string) {
    await supabase.from('property_images').update({ is_cover: false }).eq('property_id', propertyId);
    await supabase.from('property_images').update({ is_cover: true }).eq('id', imageId);
    fetchProperty();
  }

  function formatPrice(p: number) {
    return '₪' + p.toLocaleString('he-IL');
  }

  function imageUrl(path: string) {
    return `${SUPABASE_URL}/storage/v1/object/public/property-images/${path}`;
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) return <div className="text-center py-20 text-gray-500">נכס לא נמצא</div>;

  const d = property.property_details;
  const originalPrice = priceHistory.length > 0
    ? priceHistory[priceHistory.length - 1].old_price
    : property.current_price;
  const priceDrop = originalPrice - property.current_price;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-white transition-colors">←</button>
          <div>
            <h1 className="text-xl font-bold text-white">{property.title}</h1>
            <p className="text-gray-500 text-sm">{property.city} · {property.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isOwn && (
            <span className="text-xs px-3 py-1 bg-purple-900/40 text-purple-400 rounded-full">
              {property.agents?.full_name}
            </span>
          )}
          <span className={`text-xs px-3 py-1 rounded-full ${
            property.status === 'active' ? 'bg-green-900/40 text-green-400' :
            property.status === 'sold' ? 'bg-blue-900/40 text-blue-400' : 'bg-gray-800 text-gray-500'
          }`}>
            {property.status === 'active' ? 'פעיל' : property.status === 'sold' ? 'נמכר' : 'לא פעיל'}
          </span>
        </div>
      </div>

      {/* Price Banner */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6 flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold text-blue-400">{formatPrice(property.current_price)}</div>
          {priceDrop > 0 && (
            <div className="text-sm text-green-500 mt-1">
              ירד ב-{formatPrice(priceDrop)} מהמחיר המקורי ({formatPrice(originalPrice)})
            </div>
          )}
        </div>
        {isOwn && !editingPrice && (
          <button
            onClick={() => { setEditingPrice(true); setNewPrice(String(property.current_price)); }}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors"
          >
            עדכן מחיר
          </button>
        )}
        {editingPrice && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white w-36 text-sm focus:outline-none focus:border-blue-500"
              placeholder="מחיר חדש"
            />
            <input
              type="text"
              value={priceReason}
              onChange={e => setPriceReason(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white w-32 text-sm focus:outline-none focus:border-blue-500"
              placeholder="סיבה (אופציונלי)"
            />
            <button onClick={handlePriceUpdate} disabled={savingPrice} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm transition-colors">
              {savingPrice ? '...' : 'שמור'}
            </button>
            <button onClick={() => setEditingPrice(false)} className="text-gray-500 hover:text-white text-sm transition-colors">ביטול</button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 w-fit">
        {([['overview', 'פרטים'], ['images', 'תמונות'], ['price', 'היסטוריית מחיר'], ['share', 'שיתוף'], ['messages', 'הודעות']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors relative ${
              tab === key ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {label}
            {key === 'messages' && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {d && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">מפרט הנכס</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'שטח מגרש', value: d.lot_size_sqm ? `${d.lot_size_sqm} מ"ר` : null },
                  { label: 'שטח בנוי', value: d.built_size_sqm ? `${d.built_size_sqm} מ"ר` : null },
                  { label: 'חדרים', value: d.bedrooms ? String(d.bedrooms) : null },
                  { label: 'חדרי אמבטיה', value: d.bathrooms ? String(d.bathrooms) : null },
                  { label: 'גיל הנכס', value: d.house_age_years ? `${d.house_age_years} שנים` : null },
                  { label: 'חניות', value: d.parking_spaces ? String(d.parking_spaces) : null },
                ].filter(x => x.value).map(item => (
                  <div key={item.label} className="bg-gray-800 rounded-lg p-3">
                    <div className="text-gray-500 text-xs mb-1">{item.label}</div>
                    <div className="text-white font-medium">{item.value}</div>
                  </div>
                ))}
              </div>
              {(d.has_garden || d.has_balcony || d.has_pool) && (
                <div className="flex gap-2 mt-4">
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
          {property.description && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-3">תיאור</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{property.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Images Tab */}
      {tab === 'images' && (
        <div>
          {isOwn && (
            <label className="flex items-center gap-2 w-fit bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors mb-6 text-sm">
              {uploading ? '...' : '+ העלה תמונות'}
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
          {property.property_images.length === 0 ? (
            <div className="text-center py-16 text-gray-500">אין תמונות עדיין</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.property_images
                .sort((a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0))
                .map(img => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-video bg-gray-800">
                    <img src={imageUrl(img.storage_path)} alt="" className="w-full h-full object-cover" />
                    {img.is_cover && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium">
                        תמונת כותרת
                      </div>
                    )}
                    {isOwn && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!img.is_cover && (
                          <button
                            onClick={() => handleSetCover(img.id)}
                            className="bg-yellow-500 text-black text-xs px-3 py-1 rounded-lg"
                          >
                            הגדר כותרת
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteImage(img.id, img.storage_path)}
                          className="bg-red-600 text-white text-xs px-3 py-1 rounded-lg"
                        >
                          מחק
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {tab === 'messages' && (
        <div className="flex flex-col gap-4">
          {/* Mark all read */}
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="self-start text-xs text-blue-400 hover:text-blue-300 transition-colors">
              סמן הכל כנקרא ({unreadCount})
            </button>
          )}

          {/* Thread */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3 min-h-[200px]">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm">אין הודעות עדיין</div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_type === 'agent' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    msg.sender_type === 'agent'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-gray-800 text-white rounded-tl-sm'
                  }`}>
                    <div className="text-xs opacity-60 mb-1">
                      {msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <p className="text-sm">{msg.message_text}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Reply */}
          <div className="flex gap-2">
            <input
              type="text"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendReply()}
              placeholder="כתוב תגובה..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
            <button
              onClick={sendReply}
              disabled={sendingReply || !replyText.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              {sendingReply ? '...' : 'שלח'}
            </button>
          </div>
        </div>
      )}

      {/* Share Tab */}
      {tab === 'share' && (
        <div className="space-y-4">
          {/* Create new link */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">צור קישור חדש ללקוח</h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newLinkName}
                onChange={e => setNewLinkName(e.target.value)}
                placeholder="שם הלקוח (אופציונלי)"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
              />
              <button
                onClick={createSharedLink}
                disabled={creatingLink}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm transition-colors"
              >
                {creatingLink ? '...' : '+ צור קישור'}
              </button>
            </div>
          </div>

          {/* Existing links */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {sharedLinks.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-sm">אין קישורים עדיין</div>
            ) : (
              <div className="divide-y divide-gray-800">
                {sharedLinks.map(link => (
                  <div key={link.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white text-sm font-medium truncate">
                          {link.client_name || 'ללא שם'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          link.is_active ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-500'
                        }`}>
                          {link.is_active ? 'פעיל' : 'בוטל'}
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(link.created_at).toLocaleDateString('he-IL')} · {link.access_count} צפיות
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {link.is_active && (
                        <>
                          <button
                            onClick={() => copyLink(link.token, link.id)}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            {copiedId === link.id ? '✓ הועתק' : 'העתק קישור'}
                          </button>
                          <button
                            onClick={() => revokeLink(link.id)}
                            className="text-red-500 hover:text-red-400 text-xs transition-colors"
                          >
                            בטל
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price History Tab */}
      {tab === 'price' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {priceHistory.length === 0 ? (
            <div className="text-center py-16 text-gray-500">אין שינויי מחיר עדיין</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-right text-gray-500 font-medium px-6 py-3">תאריך</th>
                  <th className="text-right text-gray-500 font-medium px-6 py-3">מחיר ישן</th>
                  <th className="text-right text-gray-500 font-medium px-6 py-3">מחיר חדש</th>
                  <th className="text-right text-gray-500 font-medium px-6 py-3">שינוי</th>
                  <th className="text-right text-gray-500 font-medium px-6 py-3">סיבה</th>
                </tr>
              </thead>
              <tbody>
                {priceHistory.map(h => {
                  const diff = h.new_price - h.old_price;
                  const pct = ((diff / h.old_price) * 100).toFixed(1);
                  return (
                    <tr key={h.id} className="border-b border-gray-800 last:border-0">
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(h.changed_at).toLocaleDateString('he-IL')}
                      </td>
                      <td className="px-6 py-4 text-gray-400">{formatPrice(h.old_price)}</td>
                      <td className="px-6 py-4 text-white font-medium">{formatPrice(h.new_price)}</td>
                      <td className={`px-6 py-4 font-medium ${diff < 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {diff < 0 ? '↓' : '↑'} {Math.abs(Number(pct))}%
                      </td>
                      <td className="px-6 py-4 text-gray-500">{h.reason || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

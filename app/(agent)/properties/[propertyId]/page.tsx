'use client';

// ─── Feature Flags ────────────────────────────────────────────────────────────
// To re-enable the Facebook post generator: set FB_POST_ENABLED = true
const FB_POST_ENABLED = true;
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, use, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import { supabase } from '@/lib/supabase';
import type { Property, PropertyDetails, PropertyImage, PriceHistory, Agent, SharedLink, Message, Offer } from '@/types';
import TagInput from '@/components/TagInput';

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
  const searchParams = useSearchParams();
  const { updatePrice, uploadImage, deleteImage } = useProperties();

  const [property, setProperty] = useState<FullProperty | null>(null);
  const [priceHistory, setPriceHistory] = useState<(PriceHistory & { agents: { full_name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'images' | 'price' | 'share' | 'messages' | 'offers' | 'internal'>(
    searchParams.get('tab') === 'messages' ? 'messages' : 'overview'
  );

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

  // Edit property state
  const [editingProperty, setEditingProperty] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [savingProperty, setSavingProperty] = useState(false);
  const [deletingProperty, setDeletingProperty] = useState(false);

  // Edit price state
  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [priceReason, setPriceReason] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  // Mark as sold
  const [confirmSold, setConfirmSold] = useState(false);
  const [markingSold, setMarkingSold] = useState(false);

  // Image upload
  const [uploading, setUploading] = useState(false);

  // Offers state
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerDate, setOfferDate] = useState('');
  const [offerBuyer, setOfferBuyer] = useState('');
  const [offerStatus, setOfferStatus] = useState<'negotiating' | 'rejected'>('negotiating');
  const [offerNotes, setOfferNotes] = useState('');
  const [offerPrivate, setOfferPrivate] = useState(false);
  const [savingOffer, setSavingOffer] = useState(false);
  const [deletingOffer, setDeletingOffer] = useState<string | null>(null);

  // Facebook post generator
  const [fbModalOpen, setFbModalOpen] = useState(false);
  const [fbPostText, setFbPostText] = useState('');
  const [fbGenerating, setFbGenerating] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);
  const [fbCopied, setFbCopied] = useState(false);

  // Internal notes + tags
  const [internalNotes, setInternalNotes] = useState('');
  const [propertyTags, setPropertyTags] = useState<string[]>([]);
  const [savingInternal, setSavingInternal] = useState(false);
  const notesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAdmin = agent?.role === 'admin';
  const isOwn = property?.agent_id === agent?.id || isAdmin;

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
    setInternalNotes(data?.internal_notes || '');
    setPropertyTags(data?.tags || []);
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProperty();
    fetchPriceHistory();
    fetchSharedLinks();
    fetchMessages();
    fetchOffers();

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
  }, [propertyId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  function openEditProperty() {
    if (!property) return;
    setEditTitle(property.title);
    setEditCity(property.city);
    setEditAddress(property.address || '');
    setEditingProperty(true);
  }

  async function handleSaveProperty() {
    if (!editTitle.trim() || !editCity.trim()) return;
    setSavingProperty(true);
    await fetch(`/api/properties/${propertyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle.trim(), city: editCity.trim(), address: editAddress.trim() }),
    });
    setEditingProperty(false);
    setSavingProperty(false);
    fetchProperty();
  }

  async function handleMarkSold() {
    setMarkingSold(true);
    await fetch(`/api/properties/${propertyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'sold' }),
    });
    setConfirmSold(false);
    setMarkingSold(false);
    fetchProperty();
  }

  async function handleDeleteProperty() {
    setDeletingProperty(false);
    await fetch(`/api/properties/${propertyId}`, { method: 'DELETE' });
    router.push('/properties');
  }

  async function saveInternalData(fields: { internal_notes?: string; tags?: string[] }) {
    setSavingInternal(true);
    await fetch(`/api/properties/${propertyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    setSavingInternal(false);
  }

  function handleNotesChange(val: string) {
    setInternalNotes(val);
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(() => saveInternalData({ internal_notes: val }), 1200);
  }

  async function handleTagsChange(newTags: string[]) {
    setPropertyTags(newTags);
    await saveInternalData({ tags: newTags });
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

  async function generateFbPost() {
    setFbGenerating(true);
    setFbError(null);
    setFbPostText('');
    try {
      const res = await fetch(`/api/properties/${propertyId}/generate-post`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'שגיאה לא ידועה');
      setFbPostText(json.text);
    } catch (err) {
      setFbError(err instanceof Error ? err.message : 'שגיאה ביצירת הטקסט');
    } finally {
      setFbGenerating(false);
    }
  }

  function openFbModal() {
    setFbModalOpen(true);
    if (!fbPostText) generateFbPost();
  }

  function copyFbPost() {
    navigator.clipboard.writeText(fbPostText);
    setFbCopied(true);
    setTimeout(() => setFbCopied(false), 2000);
  }

  async function fetchOffers() {
    setOffersLoading(true);
    const res = await fetch(`/api/properties/${propertyId}/offers`);
    const json = await res.json();
    setOffers(json.data || []);
    setOffersLoading(false);
  }

  function openAddOffer() {
    setEditingOffer(null);
    setOfferAmount('');
    setOfferDate(new Date().toISOString().split('T')[0]);
    setOfferBuyer('');
    setOfferStatus('negotiating');
    setOfferNotes('');
    setOfferPrivate(false);
    setOfferModalOpen(true);
  }

  function openEditOffer(offer: Offer) {
    setEditingOffer(offer);
    setOfferAmount(String(offer.amount));
    setOfferDate(offer.offer_date);
    setOfferBuyer(offer.buyer_description);
    setOfferStatus(offer.status);
    setOfferNotes(offer.notes || '');
    setOfferPrivate(offer.is_private);
    setOfferModalOpen(true);
  }

  async function handleSaveOffer() {
    if (!offerAmount || !offerBuyer.trim()) return;
    setSavingOffer(true);
    const body = {
      amount: Number(offerAmount),
      offer_date: offerDate,
      buyer_description: offerBuyer.trim(),
      status: offerStatus,
      notes: offerNotes.trim() || null,
      is_private: offerPrivate,
    };
    if (editingOffer) {
      await fetch(`/api/properties/${propertyId}/offers/${editingOffer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      await fetch(`/api/properties/${propertyId}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
    setOfferModalOpen(false);
    setSavingOffer(false);
    fetchOffers();
  }

  async function handleDeleteOffer(offerId: string) {
    setDeletingOffer(offerId);
    await fetch(`/api/properties/${propertyId}/offers/${offerId}`, { method: 'DELETE' });
    setDeletingOffer(null);
    fetchOffers();
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
      {/* Edit Property Modal */}
      {editingProperty && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h2 className="text-white font-semibold text-lg">עריכת פרטי נכס</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1">כותרת</label>
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">עיר</label>
              <input
                value={editCity}
                onChange={e => setEditCity(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">כתובת</label>
              <input
                value={editAddress}
                onChange={e => setEditAddress(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveProperty}
                disabled={savingProperty || !editTitle.trim() || !editCity.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm transition-colors"
              >
                {savingProperty ? '...' : 'שמור'}
              </button>
              <button
                onClick={() => setEditingProperty(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Sold Modal */}
      {confirmSold && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-white font-semibold text-lg mb-2">סמן כנמכר</h2>
            <p className="text-gray-400 text-sm mb-6">
              לסמן את <span className="text-white font-medium">{property?.title}</span> כנמכר?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleMarkSold}
                disabled={markingSold}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm transition-colors"
              >
                {markingSold ? '...' : 'נמכר'}
              </button>
              <button
                onClick={() => setConfirmSold(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingProperty && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-white font-semibold text-lg mb-2">מחיקת נכס</h2>
            <p className="text-gray-400 text-sm mb-6">
              האם אתה בטוח שברצונך למחוק את <span className="text-white font-medium">{property.title}</span>?
              פעולה זו אינה ניתנת לביטול.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteProperty}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2.5 rounded-lg text-sm transition-colors"
              >
                מחק
              </button>
              <button
                onClick={() => setDeletingProperty(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Add/Edit Modal */}
      {offerModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">
                {editingOffer ? 'עריכת הצעה' : 'הצעה חדשה'}
              </h2>
              <button
                onClick={() => setOfferModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">סכום ההצעה (₪)</label>
              <input
                type="number"
                value={offerAmount}
                onChange={e => setOfferAmount(e.target.value)}
                placeholder="לדוגמה: 2500000"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">תאריך</label>
              <input
                type="date"
                value={offerDate}
                onChange={e => setOfferDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Buyer description */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">תיאור המציע</label>
              <input
                type="text"
                value={offerBuyer}
                onChange={e => setOfferBuyer(e.target.value)}
                placeholder='לדוגמה: "זוג צעיר מכפר יונה"'
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">סטטוס</label>
              <div className="flex gap-2">
                {([['negotiating', 'במשא ומתן'], ['rejected', 'נדחתה']] as const).map(([val, lbl]) => (
                  <button
                    key={val}
                    onClick={() => setOfferStatus(val)}
                    className={`flex-1 py-2 rounded-lg text-sm transition-colors border ${
                      offerStatus === val
                        ? val === 'negotiating'
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-red-900/50 border-red-700 text-red-300'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">הערות פנימיות (אופציונלי)</label>
              <textarea
                value={offerNotes}
                onChange={e => setOfferNotes(e.target.value)}
                rows={3}
                placeholder="תנאים, הערות לסוכן..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 text-sm resize-none"
              />
            </div>

            {/* Privacy */}
            <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
              <div>
                <p className="text-white text-sm font-medium">נראות</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {offerPrivate ? 'רק אתה רואה הצעה זו' : 'כל הסוכנים במשרד רואים'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setOfferPrivate(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    !offerPrivate ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  משותף
                </button>
                <button
                  onClick={() => setOfferPrivate(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    offerPrivate ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  פרטי
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveOffer}
                disabled={savingOffer || !offerAmount || !offerBuyer.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm transition-colors"
              >
                {savingOffer ? '...' : editingOffer ? 'שמור שינויים' : 'הוסף הצעה'}
              </button>
              <button
                onClick={() => setOfferModalOpen(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg text-sm transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Facebook Post Modal */}
      {FB_POST_ENABLED && fbModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">פוסט לפייסבוק</h2>
              <button
                onClick={() => setFbModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            {fbGenerating && (
              <div className="flex items-center justify-center py-10 gap-3 text-gray-400 text-sm">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                יוצר טקסט...
              </div>
            )}

            {fbError && !fbGenerating && (
              <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3 text-red-400 text-sm">
                {fbError}
              </div>
            )}

            {fbPostText && !fbGenerating && (
              <textarea
                value={fbPostText}
                onChange={e => setFbPostText(e.target.value)}
                rows={10}
                dir="rtl"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm leading-relaxed focus:outline-none focus:border-blue-500 resize-y"
              />
            )}

            <div className="flex gap-2 pt-1">
              {fbPostText && !fbGenerating && (
                <button
                  onClick={copyFbPost}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm transition-colors"
                >
                  {fbCopied ? '✓ הועתק' : 'העתק טקסט'}
                </button>
              )}
              <button
                onClick={generateFbPost}
                disabled={fbGenerating}
                className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 py-2.5 rounded-lg text-sm transition-colors"
              >
                {fbGenerating ? '...' : fbPostText ? 'צור מחדש' : 'צור טקסט'}
              </button>
            </div>
          </div>
        </div>
      )}

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
          {FB_POST_ENABLED && (
            <button
              onClick={openFbModal}
              className="text-xs px-3 py-1.5 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded-lg transition-colors"
            >
              צור פוסט לפייסבוק
            </button>
          )}
          {isOwn && (
            <>
              <button
                onClick={openEditProperty}
                className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
              >
                עריכה
              </button>
              {property.status !== 'sold' && (
                <button
                  onClick={() => setConfirmSold(true)}
                  className="text-xs px-3 py-1.5 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded-lg transition-colors"
                >
                  נמכר
                </button>
              )}
              <button
                onClick={() => setDeletingProperty(true)}
                className="text-xs px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
              >
                מחק
              </button>
            </>
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
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 w-fit flex-wrap">
        {([['overview', 'פרטים'], ['images', 'תמונות'], ['price', 'היסטוריית מחיר'], ['offers', 'הצעות'], ['share', 'שיתוף'], ['messages', 'הודעות'], ['internal', 'פנימי 🔒']] as const).map(([key, label]) => (
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
          {/* Map */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-white font-semibold">מיקום</h2>
            </div>
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(property.city + ' ' + property.address)}&output=embed&hl=iw&z=15`}
              width="100%"
              height="280"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`מפה: ${property.address}`}
            />
          </div>
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

          {/* WhatsApp Share */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-4">שתף ב-WhatsApp</h2>
            <a
              href={`https://wa.me/?text=${encodeURIComponent([
                `🏠 *${property.title}*`,
                `📍 ${property.city}, ${property.address}`,
                `💰 ${formatPrice(property.current_price)}`,
                property.property_details?.bedrooms ? `🛏 ${property.property_details.bedrooms} חדרים` : null,
                property.property_details?.built_size_sqm ? `📐 ${property.property_details.built_size_sqm} מ"ר` : null,
                ``,
                `לפרטים נוספים: ${typeof window !== 'undefined' ? window.location.origin : ''}/org/${property.organization_id}`,
              ].filter(Boolean).join('\n'))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full text-white font-semibold py-3 px-4 rounded-xl text-sm"
              style={{ background: '#25D366' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              שתף ב-WhatsApp
            </a>
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

      {/* Offers Tab */}
      {tab === 'offers' && (
        <div className="space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">הצעות על הנכס</h2>
            <button
              onClick={openAddOffer}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              + הוסף הצעה
            </button>
          </div>

          {/* Summary bar */}
          {offers.length > 0 && (() => {
            const highest = Math.max(...offers.map(o => Number(o.amount)));
            const latest = offers[0];
            const statusLabel = latest.status === 'negotiating' ? 'במשא ומתן' : 'נדחתה';
            return (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{offers.length}</div>
                  <div className="text-gray-500 text-xs mt-1">הצעות</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <div className="text-lg font-bold text-blue-400">{'₪' + highest.toLocaleString('he-IL')}</div>
                  <div className="text-gray-500 text-xs mt-1">הצעה גבוהה ביותר</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <div className={`text-sm font-semibold mt-1 ${latest.status === 'negotiating' ? 'text-yellow-400' : 'text-red-400'}`}>
                    {statusLabel}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">סטטוס אחרון</div>
                </div>
              </div>
            );
          })()}

          {/* Offers list or empty state */}
          {offersLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : offers.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl py-16 text-center">
              <div className="text-4xl mb-3">🤝</div>
              <div className="text-white font-medium mb-1">אין הצעות עדיין</div>
              <div className="text-gray-500 text-sm mb-5">הוסף את ההצעה הראשונה על הנכס</div>
              <button
                onClick={openAddOffer}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm transition-colors"
              >
                + הוסף הצעה ראשונה
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map(offer => {
                const isOwner = offer.agent_id === agent?.id;
                const statusColor = offer.status === 'negotiating'
                  ? 'bg-yellow-900/40 text-yellow-400'
                  : 'bg-red-900/40 text-red-400';
                const statusLabel = offer.status === 'negotiating' ? 'במשא ומתן' : 'נדחתה';
                return (
                  <div
                    key={offer.id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: amount + buyer */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xl font-bold text-blue-400">
                            {'₪' + Number(offer.amount).toLocaleString('he-IL')}
                          </span>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor}`}>
                            {statusLabel}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            offer.is_private
                              ? 'bg-gray-700 text-gray-400'
                              : 'bg-green-900/30 text-green-500'
                          }`}>
                            {offer.is_private ? 'פרטי' : 'משותף'}
                          </span>
                        </div>
                        <div className="text-white text-sm font-medium mb-0.5">{offer.buyer_description}</div>
                        <div className="text-gray-500 text-xs">
                          {new Date(offer.offer_date).toLocaleDateString('he-IL')}
                          {offer.agents?.full_name && !isOwner && (
                            <span className="mr-2 text-purple-400">· {offer.agents.full_name}</span>
                          )}
                        </div>
                        {offer.notes && (
                          <div className="mt-2 text-gray-400 text-xs bg-gray-800 rounded-lg px-3 py-2">
                            {offer.notes}
                          </div>
                        )}
                      </div>

                      {/* Right: actions (own offers only) */}
                      {isOwner && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => openEditOffer(offer)}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            עריכה
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            disabled={deletingOffer === offer.id}
                            className="text-red-500 hover:text-red-400 text-xs transition-colors disabled:opacity-50"
                          >
                            {deletingOffer === offer.id ? '...' : 'מחק'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Internal Tab */}
      {tab === 'internal' && (
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-semibold">הערות פנימיות</h2>
              {savingInternal && (
                <span className="text-gray-500 text-xs">שומר...</span>
              )}
            </div>
            <p className="text-gray-600 text-xs mb-4">נראות רק לסוכנים במשרד. לא חשופות ללקוחות.</p>
            <textarea
              value={internalNotes}
              onChange={e => handleNotesChange(e.target.value)}
              rows={7}
              dir="rtl"
              placeholder="הוסף הערות פנימיות על הנכס — מחיר מינימום, מצב משא ומתן, פרטי בעלים..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm resize-none leading-relaxed"
            />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-1">תגיות</h2>
            <p className="text-gray-600 text-xs mb-4">לשימוש פנימי בלבד — סינון וארגון נכסים. לחץ Enter או פסיק להוספה.</p>
            <TagInput
              tags={propertyTags}
              onChange={handleTagsChange}
              placeholder="הקלד תגית ולחץ Enter..."
            />
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
